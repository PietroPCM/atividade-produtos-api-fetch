const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const publicDir = path.join(__dirname, 'public');
const staticFiles = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/script.js': ['script.js', 'text/javascript; charset=utf-8'],
};

function createServer() {
  const produtos = [];
  let proximoId = 1;

  function responder(res, status, dados) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(dados));
  }

  async function lerJson(req) {
    let corpo = '';
    for await (const parte of req) {
      corpo += parte;
      if (corpo.length > 1_000_000) {
        const erro = new Error('Corpo da requisição muito grande.');
        erro.status = 413;
        throw erro;
      }
    }
    try {
      return JSON.parse(corpo);
    } catch {
      const erro = new Error('Envie um JSON válido no corpo da requisição.');
      erro.status = 400;
      throw erro;
    }
  }

  function validarProduto(dados) {
    if (!dados || typeof dados.nome !== 'string' || !dados.nome.trim() ||
        typeof dados.preco !== 'number' || !Number.isFinite(dados.preco) || dados.preco < 0) {
      return 'Informe nome (texto não vazio) e preco (número maior ou igual a zero).';
    }
    return null;
  }

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const rota = url.pathname;

    try {
      if (rota === '/api/produtos') {
        if (req.method === 'GET') return responder(res, 200, produtos);
        if (req.method === 'POST') {
          const dados = await lerJson(req);
          const erro = validarProduto(dados);
          if (erro) return responder(res, 400, { erro });
          const produto = { id: proximoId++, nome: dados.nome.trim(), preco: dados.preco };
          produtos.push(produto);
          return responder(res, 201, produto);
        }
        return responder(res, 405, { erro: 'Método não permitido.' });
      }

      const produtoId = rota.match(/^\/api\/produtos\/(\d+)$/);
      if (produtoId) {
        const id = Number(produtoId[1]);
        const indice = produtos.findIndex((produto) => produto.id === id);
        if (indice === -1) return responder(res, 404, { erro: 'Produto não encontrado.' });

        if (req.method === 'GET') return responder(res, 200, produtos[indice]);
        if (req.method === 'PUT') {
          const dados = await lerJson(req);
          const erro = validarProduto(dados);
          if (erro) return responder(res, 400, { erro });
          produtos[indice] = { id, nome: dados.nome.trim(), preco: dados.preco };
          return responder(res, 200, produtos[indice]);
        }
        if (req.method === 'DELETE') {
          produtos.splice(indice, 1);
          return responder(res, 200, { mensagem: 'Produto excluído com sucesso.' });
        }
        return responder(res, 405, { erro: 'Método não permitido.' });
      }

      if (rota.startsWith('/api/')) return responder(res, 404, { erro: 'Rota não encontrada.' });

      const arquivo = staticFiles[rota];
      if (!arquivo || req.method !== 'GET') return responder(res, 404, { erro: 'Página não encontrada.' });
      const conteudo = await fs.readFile(path.join(publicDir, arquivo[0]));
      res.writeHead(200, { 'Content-Type': arquivo[1] });
      res.end(conteudo);
    } catch (erro) {
      responder(res, erro.status || 500, { erro: erro.status ? erro.message : 'Erro interno do servidor.' });
    }
  });
}

if (require.main === module) {
  const porta = Number(process.env.PORT) || 3000;
  createServer().listen(porta, '127.0.0.1', () => console.log(`Aplicação disponível em http://localhost:${porta}`));
}

module.exports = { createServer };
