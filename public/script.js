const botao = document.querySelector('#load-button');
const status = document.querySelector('#status');
const lista = document.querySelector('#products');
const contador = document.querySelector('#count');

function criarCard(produto) {
  const card = document.createElement('article');
  card.className = 'card';

  const imagemContainer = document.createElement('div');
  imagemContainer.className = 'image-wrap';
  const imagem = document.createElement('img');
  imagem.src = produto.thumbnail;
  imagem.alt = produto.title;
  imagem.loading = 'lazy';
  imagemContainer.append(imagem);

  const conteudo = document.createElement('div');
  conteudo.className = 'card-content';
  const categoria = document.createElement('p');
  categoria.className = 'category';
  categoria.textContent = produto.category.replaceAll('-', ' ');
  const nome = document.createElement('h3');
  nome.textContent = produto.title;
  const preco = document.createElement('p');
  preco.className = 'price';
  const moeda = document.createElement('span');
  moeda.className = 'currency';
  moeda.textContent = 'USD ';
  preco.append(moeda, document.createTextNode(Number(produto.price).toFixed(2)));
  conteudo.append(categoria, nome, preco);
  card.append(imagemContainer, conteudo);
  return card;
}

async function carregarProdutos() {
  botao.disabled = true;
  status.hidden = false;
  status.classList.remove('error');
  status.textContent = 'Carregando produtos…';
  lista.replaceChildren();
  contador.hidden = true;

  try {
    const response = await fetch('https://dummyjson.com/products?limit=12');
    if (!response.ok) throw new Error(`A API respondeu com status ${response.status}.`);
    const dados = await response.json();
    if (!Array.isArray(dados.products)) throw new Error('A resposta da API não contém uma lista de produtos.');

    lista.replaceChildren(...dados.products.map(criarCard));
    if (dados.products.length === 0) {
      status.textContent = 'Nenhum produto encontrado.';
    } else {
      status.hidden = true;
      contador.textContent = `${dados.products.length} produtos`;
      contador.hidden = false;
    }
  } catch (erro) {
    status.classList.add('error');
    status.textContent = `Não foi possível carregar os produtos. ${erro.message} Tente novamente.`;
  } finally {
    botao.disabled = false;
  }
}

botao.addEventListener('click', carregarProdutos);
