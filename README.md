# Produtos: API e página com fetch

Projeto em JavaScript puro, sem dependências externas. A API mantém os produtos em memória enquanto o servidor estiver ligado. A página usa a API pública DummyJSON de forma independente da API local.

## Executar

Requer Node.js 18 ou superior.

```bash
npm start
```

Abra http://localhost:3000 e clique em **Carregar produtos**.

## Rotas da API local

| Método | Rota | Resultado |
| --- | --- | --- |
| POST | `/api/produtos` | Cria produto (`201`) |
| GET | `/api/produtos` | Lista produtos (`200`) |
| GET | `/api/produtos/:id` | Consulta produto (`200` ou `404`) |
| PUT | `/api/produtos/:id` | Atualiza nome e preço (`200` ou `404`) |
| DELETE | `/api/produtos/:id` | Exclui produto (`200` ou `404`) |

Para criar ou atualizar, envie JSON como `{"nome":"Caderno","preco":19.90}` com o cabeçalho `Content-Type: application/json`. Nome vazio, preço inválido e JSON malformado retornam `400`.

Exemplo com curl:

```bash
curl -X POST http://localhost:3000/api/produtos -H 'Content-Type: application/json' -d '{"nome":"Caderno","preco":19.90}'
curl http://localhost:3000/api/produtos
curl http://localhost:3000/api/produtos/1
curl -X PUT http://localhost:3000/api/produtos/1 -H 'Content-Type: application/json' -d '{"nome":"Caderno grande","preco":24.90}'
curl -X DELETE http://localhost:3000/api/produtos/1
```

Execute `npm test` para testar as rotas.
