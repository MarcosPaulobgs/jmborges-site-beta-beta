// ========================= FIREBASE (CDN) ========================= // Comentário do bloco
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"; // Importa init app
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"; // Importa auth
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"; // Importa firestore
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js"; // Importa storage

// ========================= CONFIG FIREBASE ========================= // Comentário do bloco
const firebaseConfig = { // Config do Firebase
  apiKey: "COLE_AQUI", // apiKey
  authDomain: "COLE_AQUI", // authDomain
  projectId: "COLE_AQUI", // projectId
  storageBucket: "COLE_AQUI", // storageBucket
  messagingSenderId: "COLE_AQUI", // senderId
  appId: "COLE_AQUI" // appId
}; // Fim config

const app = initializeApp(firebaseConfig); // Inicializa app
const auth = getAuth(app); // Inicializa auth
const db = getFirestore(app); // Inicializa firestore
const storage = getStorage(app); // Inicializa storage

// ========================= DOM ========================= // Comentário do bloco
const loginBox = document.getElementById("loginBox"); // Caixa de login
const panelBox = document.getElementById("panelBox"); // Caixa do painel
const logoutBtn = document.getElementById("logoutBtn"); // Botão sair
const email = document.getElementById("email"); // Input email
const password = document.getElementById("password"); // Input senha
const loginBtn = document.getElementById("loginBtn"); // Botão entrar
const loginMsg = document.getElementById("loginMsg"); // Mensagem login

const pName = document.getElementById("pName"); // Nome produto
const pDesc = document.getElementById("pDesc"); // Desc produto
const pPriceText = document.getElementById("pPriceText"); // Preço texto
const pImage = document.getElementById("pImage"); // Input file
const preview = document.getElementById("preview"); // Div prévia
const pHighlighted = document.getElementById("pHighlighted"); // Checkbox destaque
const pHighlightOrder = document.getElementById("pHighlightOrder"); // Ordem
const saveBtn = document.getElementById("saveBtn"); // Salvar
const cancelBtn = document.getElementById("cancelBtn"); // Cancelar
const editingId = document.getElementById("editingId"); // Id edição
const formTitle = document.getElementById("formTitle"); // Título form

const filterInput = document.getElementById("filterInput"); // Busca lista
const list = document.getElementById("list"); // Lista

// ========================= STATE ========================= // Comentário do bloco
let productsCache = []; // Cache produtos
let previewUrl = ""; // URL de prévia

// ========================= AUTH ========================= // Comentário do bloco
loginBtn.addEventListener("click", async () => { // Quando clicar em entrar
  loginMsg.textContent = ""; // Limpa msg
  try { // Tenta login
    await signInWithEmailAndPassword(auth, email.value.trim(), password.value); // Faz login
  } catch (e) { // Se erro
    loginMsg.textContent = "Falha no login: " + e.message; // Mostra msg
  } // Fim catch
}); // Fim listener

logoutBtn.addEventListener("click", async () => { // Ao clicar sair
  await signOut(auth); // Faz logout
}); // Fim listener

onAuthStateChanged(auth, (user) => { // Observa login
  if (user) { // Se logado
    loginBox.hidden = true; // Esconde login
    panelBox.hidden = false; // Mostra painel
    startRealtime(); // Inicia leitura tempo real
  } else { // Se deslogado
    loginBox.hidden = false; // Mostra login
    panelBox.hidden = true; // Esconde painel
  } // Fim else
}); // Fim auth observer

// ========================= UPLOAD + PREVIEW ========================= // Comentário do bloco
pImage.addEventListener("change", () => { // Ao escolher arquivo
  const file = pImage.files?.[0]; // Pega arquivo
  if (!file) return; // Se não tem, sai
  const url = URL.createObjectURL(file); // Cria URL local
  previewUrl = url; // Guarda
  preview.innerHTML = `<img src="${url}" alt="preview" />`; // Mostra prévia
}); // Fim listener

// ========================= CRUD ========================= // Comentário do bloco
function clearForm() { // Limpa formulário
  editingId.value = ""; // Reseta id
  formTitle.textContent = "Novo produto"; // Reseta título
  pName.value = ""; // Limpa nome
  pDesc.value = ""; // Limpa desc
  pPriceText.value = ""; // Limpa preço
  pHighlighted.checked = false; // Limpa destaque
  pHighlightOrder.value = "1"; // Reseta ordem
  pImage.value = ""; // Reseta file
  previewUrl = ""; // Reseta preview
  preview.innerHTML = ""; // Limpa preview
  cancelBtn.hidden = true; // Esconde cancelar
} // Fim clearForm

cancelBtn.addEventListener("click", clearForm); // Cancela edição

async function uploadIfNeeded() { // Faz upload se tiver arquivo
  const file = pImage.files?.[0]; // Pega arquivo
  if (!file) return ""; // Se não tem, retorna vazio
  const path = `products/${Date.now()}_${file.name}`; // Caminho no storage
  const storageRef = ref(storage, path); // Referência storage
  await uploadBytes(storageRef, file); // Faz upload
  const url = await getDownloadURL(storageRef); // Pega URL pública
  return url; // Retorna URL
} // Fim uploadIfNeeded

saveBtn.addEventListener("click", async () => { // Ao clicar salvar
  const name = pName.value.trim(); // Lê nome
  const desc = pDesc.value.trim(); // Lê desc
  const priceText = pPriceText.value.trim(); // Lê preço texto
  const highlighted = Boolean(pHighlighted.checked); // Lê destaque
  const highlightOrder = Number(pHighlightOrder.value || 999999); // Lê ordem

  if (!name || !desc || !priceText) { // Validação mínima
    alert("Preencha nome, descrição e preço."); // Alerta
    return; // Sai
  } // Fim if

  const uploadedUrl = await uploadIfNeeded(); // Faz upload se tiver imagem
  const imageUrl = uploadedUrl || (getEditing()?.imageUrl || ""); // Usa upload ou mantém antiga

  if (!imageUrl) { // Se ainda sem imagem
    alert("Envie uma imagem ou mantenha a existente."); // Alerta
    return; // Sai
  } // Fim if

  const data = { // Monta objeto para Firestore
    name, // Nome
    desc, // Descrição
    priceText, // Texto preço
    price: Number(String(priceText).replace(/[^\d,]/g, "").replace(",", ".")) || 0, // Preço numérico
    imageUrl, // URL da imagem
    highlighted, // Destaque
    highlightOrder: highlighted ? highlightOrder : 999999, // Ordem (se não destaque, joga pro fim)
    createdAt: Date.now() // Data
  }; // Fim data

  const id = editingId.value; // Pega id se estiver editando

  if (id) { // Se editando
    await updateDoc(doc(db, "products", id), data); // Atualiza doc
  } else { // Se criando
    await addDoc(collection(db, "products"), data); // Cria doc
  } // Fim else

  clearForm(); // Limpa form
}); // Fim listener save

function getEditing() { // Retorna produto em edição no cache
  return productsCache.find((p) => p.id === editingId.value); // Busca por id
} // Fim getEditing

function startEdit(id) { // Inicia edição
  const p = productsCache.find((x) => x.id === id); // Encontra produto
  if (!p) return; // Se não existe, sai
  editingId.value = id; // Seta id
  formTitle.textContent = "Editar produto"; // Muda título
  pName.value = p.name; // Preenche nome
  pDesc.value = p.desc; // Preenche desc
  pPriceText.value = p.priceText; // Preenche preço texto
  pHighlighted.checked = p.highlighted; // Preenche destaque
  pHighlightOrder.value = String(p.highlightOrder || 1); // Preenche ordem
  previewUrl = p.imageUrl; // Seta preview como atual
  preview.innerHTML = `<img src="${p.imageUrl}" alt="preview" />`; // Mostra preview
  cancelBtn.hidden = false; // Mostra cancelar
} // Fim startEdit

async function removeProduct(id) { // Remove produto
  const ok = confirm("Excluir este produto?"); // Confirma
  if (!ok) return; // Se não, sai
  await deleteDoc(doc(db, "products", id)); // Apaga do Firestore
} // Fim removeProduct

// ========================= LISTA (TEMPO REAL) ========================= // Comentário do bloco
function renderList() { // Renderiza lista admin
  const q = filterInput.value.trim().toLowerCase(); // Termo busca
  const filtered = productsCache.filter((p) => (p.name + " " + p.desc).toLowerCase().includes(q)); // Filtra
  list.innerHTML = ""; // Limpa lista

  filtered.forEach((p) => { // Para cada produto
    const row = document.createElement("div"); // Cria linha
    row.className = "row"; // Classe
    row.innerHTML = `
      <img src="${p.imageUrl}" alt="${p.name}" />
      <div class="meta">
        <strong>${p.name}</strong>
        <div style="opacity:.7">${p.priceText}</div>
        <div style="opacity:.7">${p.highlighted ? "⭐ Destaque #" + p.highlightOrder : ""}</div>
      </div>
      <div class="actions">
        <button type="button" class="ghost" data-edit="${p.id}">Editar</button>
        <button type="button" class="danger" data-del="${p.id}">Excluir</button>
      </div>
    `; // HTML
    list.appendChild(row); // Anexa
  }); // Fim forEach

  list.querySelectorAll("[data-edit]").forEach((b) => { // Botões editar
    b.addEventListener("click", () => startEdit(b.dataset.edit)); // Inicia edição
  }); // Fim bind edit

  list.querySelectorAll("[data-del]").forEach((b) => { // Botões excluir
    b.addEventListener("click", () => removeProduct(b.dataset.del)); // Exclui
  }); // Fim bind del
} // Fim renderList

filterInput.addEventListener("input", renderList); // Busca no admin em tempo real

function startRealtime() { // Inicia listener realtime
  const refCol = collection(db, "products"); // Ref coleção
  const q = query(refCol, orderBy("highlightOrder", "asc")); // Ordena por ordem
  onSnapshot(q, (snap) => { // Observa mudanças
    productsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() })); // Atualiza cache
    renderList(); // Renderiza lista
  }); // Fim snapshot
} // Fim startRealtime