const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createServer } = require('../server');

test('ciclo de criação, listagem, consulta, atualização e exclusão', async () => {
  const server = createServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://localhost:${server.address().port}/api/produtos`;
  const requisicao = (url, method = 'GET', body) => fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  try {
    let resposta = await requisicao(base);
    assert.equal(resposta.status, 200);
    assert.deepEqual(await resposta.json(), []);

    resposta = await requisicao(base, 'POST', { nome: 'Caderno', preco: 19.9 });
    assert.equal(resposta.status, 201);
    assert.deepEqual(await resposta.json(), { id: 1, nome: 'Caderno', preco: 19.9 });

    resposta = await requisicao(base);
    assert.equal((await resposta.json()).length, 1);

    resposta = await requisicao(`${base}/1`);
    assert.equal(resposta.status, 200);
    assert.equal((await resposta.json()).nome, 'Caderno');

    resposta = await requisicao(`${base}/1`, 'PUT', { nome: 'Caderno grande', preco: 24.9 });
    assert.equal(resposta.status, 200);
    assert.deepEqual(await resposta.json(), { id: 1, nome: 'Caderno grande', preco: 24.9 });

    resposta = await requisicao(`${base}/1`, 'DELETE');
    assert.equal(resposta.status, 200);
    assert.equal((await resposta.json()).mensagem, 'Produto excluído com sucesso.');

    for (const method of ['GET', 'PUT', 'DELETE']) {
      resposta = await requisicao(`${base}/1`, method, method === 'PUT' ? { nome: 'Outro', preco: 1 } : undefined);
      assert.equal(resposta.status, 404);
    }
    resposta = await requisicao(base);
    assert.deepEqual(await resposta.json(), []);
  } finally {
    server.close();
  }
});

test('rejeita corpo inválido', async () => {
  const server = createServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://localhost:${server.address().port}/api/produtos`;
  try {
    const resposta = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: '', preco: -1 }),
    });
    assert.equal(resposta.status, 400);
  } finally {
    server.close();
  }
});
