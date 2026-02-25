#!/usr/bin/env node
/**
 * MCP Server for lipgloss-ts
 * Provides terminal styling as tools via the Model Context Protocol.
 *
 * This is a minimal stdio-based MCP server implementation.
 */

import { NewStyle, JoinHorizontal, JoinVertical, Width, Height } from './index.js';
import type { Border, Position } from './types.js';
import { getBorderByName } from './border.js';

interface MCPRequest {
  jsonrpc: '2.0';
  id?: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id?: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}

const tools = [
  {
    name: 'style_render',
    description: 'Render styled text with lipgloss. Supports colors, bold, italic, underline, borders, padding, margin, alignment, width constraints.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to render' },
        bold: { type: 'boolean' },
        italic: { type: 'boolean' },
        underline: { type: 'boolean' },
        strikethrough: { type: 'boolean' },
        faint: { type: 'boolean' },
        foreground: { type: 'string', description: 'Foreground color (hex or ANSI number)' },
        background: { type: 'string', description: 'Background color' },
        width: { type: 'number' },
        height: { type: 'number' },
        align: { type: 'string', enum: ['left', 'center', 'right'] },
        padding: { type: 'array', items: { type: 'number' }, description: 'Padding [all] or [v,h] or [t,r,b,l]' },
        margin: { type: 'array', items: { type: 'number' }, description: 'Margin [all] or [v,h] or [t,r,b,l]' },
        border: { type: 'string', enum: ['normal', 'rounded', 'double', 'thick', 'hidden', 'block', 'ascii', 'none'] },
        borderForeground: { type: 'string' },
      },
      required: ['text'],
    },
  },
  {
    name: 'join_horizontal',
    description: 'Join multiple styled text blocks horizontally',
    inputSchema: {
      type: 'object',
      properties: {
        position: { type: 'string', enum: ['top', 'center', 'bottom'], default: 'top' },
        blocks: { type: 'array', items: { type: 'string' }, description: 'Text blocks to join' },
      },
      required: ['blocks'],
    },
  },
  {
    name: 'join_vertical',
    description: 'Join multiple styled text blocks vertically',
    inputSchema: {
      type: 'object',
      properties: {
        position: { type: 'string', enum: ['left', 'center', 'right'], default: 'left' },
        blocks: { type: 'array', items: { type: 'string' }, description: 'Text blocks to join' },
      },
      required: ['blocks'],
    },
  },
  {
    name: 'measure',
    description: 'Measure the width and height of a text block',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
  },
];

function posFromString(s?: string): Position {
  switch (s) {
    case 'center': return 0.5;
    case 'right': case 'bottom': return 1.0;
    default: return 0.0;
  }
}

function handleRequest(req: MCPRequest): MCPResponse {
  const { method, params, id } = req;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0', id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: '@indiekit/lipgloss', version: '0.1.0' },
      },
    };
  }

  if (method === 'notifications/initialized') {
    return { jsonrpc: '2.0', id, result: {} };
  }

  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools } };
  }

  if (method === 'tools/call') {
    const toolName = (params as any)?.name;
    const args = (params as any)?.arguments || {};

    try {
      let result: string;

      switch (toolName) {
        case 'style_render': {
          let s = NewStyle();
          if (args.bold) s = s.bold();
          if (args.italic) s = s.italic();
          if (args.underline) s = s.underline();
          if (args.strikethrough) s = s.strikethrough();
          if (args.faint) s = s.faint();
          if (args.foreground) s = s.foreground(args.foreground);
          if (args.background) s = s.background(args.background);
          if (args.width) s = s.width(args.width);
          if (args.height) s = s.height(args.height);
          if (args.align) s = s.align(posFromString(args.align));
          if (args.padding) s = s.padding(...args.padding);
          if (args.margin) s = s.margin(...args.margin);
          if (args.border) s = s.border(args.border);
          if (args.borderForeground) s = s.borderForeground(args.borderForeground);
          result = s.render(args.text);
          break;
        }
        case 'join_horizontal': {
          result = JoinHorizontal(posFromString(args.position), ...(args.blocks || []));
          break;
        }
        case 'join_vertical': {
          result = JoinVertical(posFromString(args.position), ...(args.blocks || []));
          break;
        }
        case 'measure': {
          const w = Width(args.text || '');
          const h = Height(args.text || '');
          result = JSON.stringify({ width: w, height: h });
          break;
        }
        default:
          return { jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown tool: ${toolName}` } };
      }

      return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: result }] } };
    } catch (e: any) {
      return { jsonrpc: '2.0', id, error: { code: -32603, message: e.message } };
    }
  }

  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown method: ${method}` } };
}

// stdio transport
let buffer = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (chunk: string) => {
  buffer += chunk;
  while (true) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) break;

    const header = buffer.slice(0, headerEnd);
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) { buffer = buffer.slice(headerEnd + 4); continue; }

    const len = parseInt(match[1], 10);
    const bodyStart = headerEnd + 4;
    if (buffer.length < bodyStart + len) break;

    const body = buffer.slice(bodyStart, bodyStart + len);
    buffer = buffer.slice(bodyStart + len);

    try {
      const req = JSON.parse(body) as MCPRequest;
      const resp = handleRequest(req);
      if (resp && req.id !== undefined) {
        const respBody = JSON.stringify(resp);
        process.stdout.write(`Content-Length: ${Buffer.byteLength(respBody)}\r\n\r\n${respBody}`);
      }
    } catch {
      // ignore malformed
    }
  }
});

process.stderr.write('@indiekit/lipgloss MCP server started\n');
