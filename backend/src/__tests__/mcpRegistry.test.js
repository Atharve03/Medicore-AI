const mcpRegistry = require('../mcp/registry/mcpRegistry');

describe('mcpRegistry', () => {
  afterEach(() => {
    mcpRegistry._reset();
  });

  it('registers a server and lists its tools', () => {
    mcpRegistry.registerServer({
      name: 'demo',
      description: 'A demo server',
      tools: {
        ping: { description: 'Returns pong', handler: async () => 'pong' },
      },
    });

    const servers = mcpRegistry.listServers();
    expect(servers).toHaveLength(1);
    expect(servers[0].name).toBe('demo');
    expect(servers[0].tools).toEqual([{ name: 'ping', description: 'Returns pong' }]);
  });

  it('rejects registering the same server name twice', () => {
    const server = {
      name: 'demo',
      description: 'x',
      tools: { ping: { description: 'x', handler: async () => null } },
    };
    mcpRegistry.registerServer(server);
    expect(() => mcpRegistry.registerServer(server)).toThrow(/already registered/);
  });

  it('rejects a server with no tools', () => {
    expect(() =>
      mcpRegistry.registerServer({ name: 'empty', description: 'x', tools: {} })
    ).toThrow(/at least one tool/);
  });

  it('invokes a registered tool with args and context', async () => {
    mcpRegistry.registerServer({
      name: 'demo',
      description: 'x',
      tools: {
        echo: {
          description: 'Echoes args back',
          handler: async (args, context) => ({ args, userId: context.requestingUser.id }),
        },
      },
    });

    const result = await mcpRegistry.callTool(
      'demo',
      'echo',
      { hello: 'world' },
      { requestingUser: { id: 'u1', role: 'admin' } }
    );

    expect(result).toEqual({ args: { hello: 'world' }, userId: 'u1' });
  });

  it('throws on an unknown server', async () => {
    await expect(
      mcpRegistry.callTool('nope', 'ping', {}, { requestingUser: { id: 'u1' } })
    ).rejects.toThrow(/Unknown MCP server/);
  });

  it('throws on an unknown tool for a known server', async () => {
    mcpRegistry.registerServer({
      name: 'demo',
      description: 'x',
      tools: { ping: { description: 'x', handler: async () => 'pong' } },
    });

    await expect(
      mcpRegistry.callTool('demo', 'nope', {}, { requestingUser: { id: 'u1' } })
    ).rejects.toThrow(/Unknown tool/);
  });

  it('requires a requestingUser in context', async () => {
    mcpRegistry.registerServer({
      name: 'demo',
      description: 'x',
      tools: { ping: { description: 'x', handler: async () => 'pong' } },
    });

    await expect(mcpRegistry.callTool('demo', 'ping', {}, {})).rejects.toThrow(
      /requestingUser/
    );
  });
});
