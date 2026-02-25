import "./dashboard.css";
import { supabase } from "./supabase.js";

const { data, error } = await supabase.from("rooms").select("*");

// Popula selects com opções
const select = document.getElementById("salas");
select.innerHTML = '<option value="">Selecione</option>';
data.forEach((element, index) => {
  console.log(element.name);
  const opt = document.createElement("option");
  opt.value = element.name;
  opt.textContent = element.name;
  select.appendChild(opt);
});

if (error) console.error(error);
else console.log(data);

//Meses e quantidade de dias
// const months = [
//   "JAN",
//   "FEV",
//   "MAR",
//   "ABR",
//   "MAI",
//   "JUN",
//   "JUL",
//   "AGO",
//   "SET",
//   "OUT",
//   "NOV",
//   "DEZ",
// ];
// const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// let currentMonth = new Date().getMonth(); // abre no mês atual

// // Dados do localStorage
// let agendamentosPorSala =
//   JSON.parse(localStorage.getItem("agendamentosPorSala")) || {};
// let salas = JSON.parse(localStorage.getItem("salas")) || [
//   "Sala 101",
//   "Sala 102",
// ];
// let professores = JSON.parse(localStorage.getItem("professores")) || [
//   "Prof. Ana",
//   "Prof. Carlos",
// ];
// const turnos = ["Manhã", "Tarde", "Noite"];

// // Popula selects com opções
// function populateSelect(id, options) {
//   const select = document.getElementById(id);
//   select.innerHTML = '<option value="">Selecione</option>';
//   options.forEach((opcao) => {
//     const opt = document.createElement("option");
//     opt.value = opcao;
//     opt.textContent = opcao;
//     select.appendChild(opt);
//   });
// }

// // Gera o calendário do mês atual
// function generateCalendar() {
//   const calendarBody = document.getElementById("calendarBody");
//   calendarBody.innerHTML = "";

//   const firstDay = new Date(2025, currentMonth, 1).getDay();
//   const numDays = daysInMonth[currentMonth];
//   const salaAtual = document.getElementById("salas").value;
//   const agendamentosSala = (agendamentosPorSala[salaAtual] || []).filter(
//     (a) => a.mes === currentMonth,
//   );

//   let row = "<tr>";
//   for (let i = 0; i < firstDay; i++) {
//     row += "<td></td>";
//   }

//   for (let day = 1; day <= numDays; day++) {
//     if ((firstDay + day - 1) % 7 === 0 && day !== 1) row += "</tr><tr>";

//     const agendamentosDoDia = agendamentosSala.filter((a) => a.dia === day);
//     const conteudoAgendamentos = agendamentosDoDia
//       .map(
//         (a) => `
//             <div class="agendamento">
//                 ${a.professor}<br>${a.turno}
//                 <span class="remove-agendamento" onclick="removerAgendamento(${a.dia}, ${a.mes}, '${a.professor}', '${a.turno}', '${a.sala}')">❌</span>
//             </div>
//         `,
//       )
//       .join("");

//     row += `<td data-day="${day}" onclick="selecionarDia(this)">
//                     ${day}
//                     <div class="agendamentos">${conteudoAgendamentos}</div>
//                 </td>`;
//   }

//   row += "</tr>";
//   calendarBody.innerHTML = row;
//   document.getElementById("monthName").innerText = months[currentMonth];
// }

// // Selecionar ou desselecionar um dia
// function selecionarDia(td) {
//   const jaSelecionado = td.classList.contains("selected-day");
//   document
//     .querySelectorAll("#calendarBody td")
//     .forEach((d) => d.classList.remove("selected-day"));
//   if (!jaSelecionado) td.classList.add("selected-day");
// }

// // Mudar o mês
// function changeMonth(step) {
//   currentMonth = (currentMonth + step + 12) % 12;
//   generateCalendar();
// }

// // Confirma o agendamento
// function confirmarAgendamento() {
//   const sala = document.getElementById("salas").value;
//   const turno = document.getElementById("turno").value;
//   const professor = document.getElementById("professor").value;
//   const diaSelecionado = document.querySelector(".selected-day");

//   if (!sala || !turno || !professor) {
//     alert("Preencha todos os campos antes de agendar.");
//     return;
//   }

//   if (!diaSelecionado) {
//     alert("Selecione um dia no calendário.");
//     return;
//   }

//   const dia = parseInt(diaSelecionado.getAttribute("data-day"));

//   if (!agendamentosPorSala[sala]) agendamentosPorSala[sala] = [];

//   const conflitoSala = agendamentosPorSala[sala].some(
//     (a) => a.dia === dia && a.mes === currentMonth && a.turno === turno,
//   );
//   if (conflitoSala) {
//     alert("Essa sala já está agendada para esse turno nesse dia.");
//     return;
//   }

//   const conflitoProfessor = Object.values(agendamentosPorSala)
//     .flat()
//     .some(
//       (a) =>
//         a.professor === professor &&
//         a.dia === dia &&
//         a.mes === currentMonth &&
//         a.turno === turno,
//     );
//   if (conflitoProfessor) {
//     alert("Esse professor já está agendado em outra sala nesse turno e dia.");
//     return;
//   }

//   const novoAgendamento = {
//     dia,
//     mes: currentMonth,
//     professor,
//     turno,
//     sala,
//   };

//   agendamentosPorSala[sala].push(novoAgendamento);
//   localStorage.setItem(
//     "agendamentosPorSala",
//     JSON.stringify(agendamentosPorSala),
//   );
//   generateCalendar();
// }

// // Remove um agendamento
// function removerAgendamento(dia, mes, professor, turno, sala) {
//   const confirmar = confirm(
//     `Deseja remover o agendamento de ${professor} na sala ${sala} (${turno}) do dia ${dia}/${mes + 1}?`,
//   );
//   if (!confirmar) return;

//   if (!agendamentosPorSala[sala]) return;

//   agendamentosPorSala[sala] = agendamentosPorSala[sala].filter(
//     (a) =>
//       !(
//         a.dia === dia &&
//         a.mes === mes &&
//         a.professor === professor &&
//         a.turno === turno
//       ),
//   );

//   if (agendamentosPorSala[sala].length === 0) {
//     delete agendamentosPorSala[sala];
//   }

//   localStorage.setItem(
//     "agendamentosPorSala",
//     JSON.stringify(agendamentosPorSala),
//   );
//   generateCalendar();
// }
// function adicionarSala() {
//   const novaSala = document.getElementById("novaSala").value.trim();
//   if (!novaSala) return;

//   if (salas.includes(novaSala)) {
//     alert("Essa sala já está cadastrada.");
//     return;
//   }

//   const confirmar = confirm(`Deseja adicionar a sala "${novaSala}"?`);
//   if (!confirmar) return;

//   salas.push(novaSala);
//   localStorage.setItem("salas", JSON.stringify(salas));
//   populateSelect("salas", salas);
//   atualizarListaSalas();
//   document.getElementById("novaSala").value = "";
// }

// function adicionarProfessor() {
//   const novoProfessor = document.getElementById("novoProfessor").value.trim();
//   if (!novoProfessor) return;

//   if (professores.includes(novoProfessor)) {
//     alert("Esse professor já está cadastrado.");
//     return;
//   }

//   const confirmar = confirm(`Deseja adicionar o professor "${novoProfessor}"?`);
//   if (!confirmar) return;

//   professores.push(novoProfessor);
//   localStorage.setItem("professores", JSON.stringify(professores));
//   populateSelect("professor", professores);
//   atualizarListaProfessores();
//   document.getElementById("novoProfessor").value = "";
// }

// // Modal de edição
// function abrirEditor() {
//   atualizarListaProfessores();
//   atualizarListaSalas();
//   new bootstrap.Modal(document.getElementById("editorModal")).show();
// }

// function atualizarListaProfessores() {
//   const lista = document.getElementById("listaProfessores");
//   lista.innerHTML = "";
//   professores.forEach((prof, i) => {
//     const li = document.createElement("li");
//     li.className =
//       "list-group-item d-flex justify-content-between align-items-center";
//     li.innerHTML = `${prof}<button class="btn-remover" onclick="removerProfessor(${i})">Remover</button>`;
//     lista.appendChild(li);
//   });
// }

// function atualizarListaSalas() {
//   const lista = document.getElementById("listaSalas");
//   lista.innerHTML = "";
//   salas.forEach((sala, i) => {
//     const li = document.createElement("li");
//     li.className =
//       "list-group-item d-flex justify-content-between align-items-center";
//     li.innerHTML = `${sala}<button class="btn-remover" onclick="removerSala(${i})">Remover</button>`;
//     lista.appendChild(li);
//   });
// }
// function removerProfessor(index) {
//   const professor = professores[index];
//   const confirmar = confirm(`Deseja remover o professor "${professor}"?`);
//   if (!confirmar) return;

//   professores.splice(index, 1);
//   localStorage.setItem("professores", JSON.stringify(professores));
//   populateSelect("professor", professores);
//   atualizarListaProfessores();
// }

// function removerSala(index) {
//   const sala = salas[index];
//   const confirmar = confirm(`Deseja remover a sala "${sala}"?`);
//   if (!confirmar) return;

//   salas.splice(index, 1);
//   localStorage.setItem("salas", JSON.stringify(salas));
//   populateSelect("salas", salas);
//   atualizarListaSalas();
// }

// // Logout
// function logout() {
//   window.location.href = "index.html";
// }

// // Inicialização
// document.addEventListener("DOMContentLoaded", () => {
//   populateSelect("salas", salas);
//   populateSelect("turno", turnos);
//   populateSelect("professor", professores);
//   generateCalendar();

//   document.getElementById("salas").addEventListener("change", generateCalendar);
//   document
//     .getElementById("prevMonth")
//     .addEventListener("click", () => changeMonth(-1));
//   document
//     .getElementById("nextMonth")
//     .addEventListener("click", () => changeMonth(1));
//   document
//     .getElementById("confirmarAgendamento")
//     .addEventListener("click", confirmarAgendamento);
// });
