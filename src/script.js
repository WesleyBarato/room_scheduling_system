import { supabase } from "./supabase.js";
import "./style.css";

// Redireciona se já estiver logado
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) window.location.href = "dashboard.html";
});

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  // Faz login no Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha,
  });

  if (error) {
    alert("Erro no login: " + error.message);
    return;
  }

  // Login deu certo 🎉
  alert("Login realizado com sucesso!");

  console.log("Usuário logado:", data.user);

  // redireciona pra outra página
  window.location.href = "dashboard.html";
});
