import "./dashboard.css";
import { supabase } from "./supabase.js";

// DATA - functions that are connected with the database(supabase)
async function getRooms() {
  return await supabase.from("rooms").select("*");
}

async function getTeachers() {
  return await supabase.from("teachers").select("*");
}

async function createRoom(room) {
  if (!room) {
    return await supabase.from("rooms").insert(room);
  } else {
    alert("Esta sala já existe!");
  }
}

async function createTeacher(teacher) {
  const { data, error } = await supabase
    .from("teachers")
    .insert(teacher)
    .select();

  return { data, error };
}

async function getBookings(month, year, roomId = null) {
  const startDate = new Date(year, month, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

  let query = supabase
    .from("bookings")
    .select("id, date, period, room_id, teacher_id, rooms(name), teachers(name)")
    .gte("date", startDate)
    .lte("date", endDate);

  if (roomId) {
    query = query.eq("room_id", roomId);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

async function createBooking(booking) {
  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select();

  return { data, error };
}

async function deleteBooking(id) {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  return { error };
}

// UI

async function loadRoomsSelect() {
  const { data, error } = await getRooms();

  if (error) {
    console.error(error);
    return;
  }

  // fill selects with options
  const select = document.getElementById("salas");
  select.innerHTML = '<option value="">Selecione</option>';
  data.forEach((element) => {
    const opt = document.createElement("option");
    opt.value = element.id;
    opt.textContent = element.name;
    select.appendChild(opt);
  });
}

async function loadTurnsSelect() {
  const shifts = ["Manhã", "Tarde", "Noite"];

  // fill selects with options
  const select = document.getElementById("shift");
  select.innerHTML = '<option value="">Selecione o turno</option>';
  shifts.forEach((element) => {
    console.log(element);
    const opt = document.createElement("option");
    opt.value = element;
    opt.textContent = element;
    select.appendChild(opt);
  });
}

async function loadTeachersSelect() {
  const { data, error } = await getTeachers();

  if (error) {
    console.error(error);
    return;
  }

  // fill selects with options
  const select = document.getElementById("professor");
  select.innerHTML = '<option value="">Selecione</option>';
  data.forEach((element) => {
    const opt = document.createElement("option");
    opt.value = element.id;
    opt.textContent = element.name;
    select.appendChild(opt);
  });
}

// HANDLER

async function handleRoomSubmit(event) {
  event.preventDefault();

  // get the room value
  const room = document.getElementById("newRoom").value;

  // create the object
  const newRoom = {
    name: room,
  };

  const { data, error } = await createRoom(newRoom);

  if (error) {
    console.error(error);
    return;
  }

  alert("Sala criada!");
  await loadRoomsSelect();
}

async function handleTeachersSubmit(event) {
  event.preventDefault();

  const input = document.getElementById("novoProfessor");
  if (!input) return;

  const teacherName = input.value.trim(); // remove espaços nas pontas

  // ✅ impede vazio e "só espaços"
  if (!teacherName) {
    alert("Digite o nome do professor.");
    input.focus();
    return;
  }

  const newTeacher = { name: teacherName };

  const { data, error } = await createTeacher(newTeacher);

  if (error) {
    console.error(error);

    // (opcional) mensagem amigável se for UNIQUE
    if (error.code === "23505") alert("Professor já existe.");
    return;
  }

  alert("Professor adicionado!");
  input.value = ""; // limpa campo
  await loadTeachersSelect(); // atualiza o select
}

// Abre o modal com agendamentos do dia
function abrirModalAgendamentosDoDia(day, bookings) {
  const modalEl = document.getElementById("dayBookingsModal");
  const titleEl = document.getElementById("dayBookingsModalLabel");
  const listEl = document.getElementById("dayBookingsList");
  if (!modalEl || !titleEl || !listEl) return;

  titleEl.textContent = `Agendamentos do dia ${day}`;
  const teacherName = (a) => (a.teachers && a.teachers.name) || "-";
  listEl.innerHTML =
    bookings.length === 0
      ? "<p class='text-muted small mb-0'>Nenhum agendamento.</p>"
      : bookings
          .map(
            (a) => `
          <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
            <span class="small">${teacherName(a)} · ${a.period}</span>
            <button type="button" class="btn btn-sm btn-outline-danger py-0 remove-agendamento-modal" data-id="${a.id}">×</button>
          </div>
        `
          )
          .join("");

  listEl.querySelectorAll(".remove-agendamento-modal").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const id = btn.getAttribute("data-id");
      if (id && confirm("Deseja remover este agendamento?")) {
        removerAgendamento(id).then(() => {
          const bsModal = bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        });
      }
    });
  });

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// Event delegation para calendário (clique no dia, ver mais e remover)
function setupCalendarEvents() {
  const calendarBody = document.getElementById("calendarBody");
  if (!calendarBody) return;

  calendarBody.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-agendamento");
    if (removeBtn) {
      e.stopPropagation();
      const id = removeBtn.getAttribute("data-id");
      if (id && confirm("Deseja remover este agendamento?")) {
        removerAgendamento(id);
      }
      return;
    }

    const verMaisBtn = e.target.closest(".btn-ver-mais");
    if (verMaisBtn) {
      e.stopPropagation();
      const dayCell = verMaisBtn.closest(".day-cell");
      const day = dayCell?.getAttribute("data-day");
      const bookingsJson = dayCell?.getAttribute("data-bookings");
      let bookings = [];
      try {
        bookings = bookingsJson ? JSON.parse(decodeURIComponent(bookingsJson)) : [];
      } catch (_) {}
      if (day) abrirModalAgendamentosDoDia(day, bookings);
      return;
    }

    const dayCell = e.target.closest(".day-cell");
    if (dayCell) {
      selecionarDia(dayCell);
      const day = dayCell.getAttribute("data-day");
      const bookingsJson = dayCell.getAttribute("data-bookings");
      let bookings = [];
      try {
        bookings = bookingsJson ? JSON.parse(decodeURIComponent(bookingsJson)) : [];
      } catch (_) {}
      if (bookings.length > 0) abrirModalAgendamentosDoDia(day, bookings);
    }
  });
}

// Logout e abrir editor (usados pelo HTML onclick)
function logout() {
  window.location.href = "index.html";
}

function abrirEditor() {
  const modal = document.getElementById("editorModal");
  if (modal && typeof bootstrap !== "undefined") {
    new bootstrap.Modal(modal).show();
  }
}

// Expor para onclick no HTML (ES modules não coloca funções no global)
window.logout = logout;
window.abrirEditor = abrirEditor;

// INIT

document.addEventListener("DOMContentLoaded", async () => {
  loadRoomsSelect();
  loadTurnsSelect();
  loadTeachersSelect();
  setupCalendarEvents();
  await generateCalendar();

  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const confirmarBtn = document.getElementById("confirmarAgendamento");
  const salasSelect = document.getElementById("salas");

  if (prevMonthBtn) prevMonthBtn.addEventListener("click", () => changeMonth(-1));
  if (nextMonthBtn) nextMonthBtn.addEventListener("click", () => changeMonth(1));
  if (confirmarBtn) confirmarBtn.addEventListener("click", confirmarAgendamento);
  if (salasSelect) salasSelect.addEventListener("change", generateCalendar);
});

let buttonAddRoom = document.getElementById("buttonAddRoom");
if (buttonAddRoom) {
  buttonAddRoom.addEventListener("click", handleRoomSubmit);
}

let buttonAddTeacher = document.getElementById("buttonAddTeacher");
if (buttonAddTeacher) {
  buttonAddTeacher.addEventListener("click", handleTeachersSubmit);
}

// Meses e quantidade de dias
const months = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function getDaysInMonth(month, year) {
  if (month === 1) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 29 : 28;
  }
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month];
}

// Verifica se a data YYYY-MM-DD corresponde ao dia/mês/ano (evita bug de timezone)
function dateMatches(dateStr, day, month, year) {
  if (!dateStr) return false;
  const parts = dateStr.split("-");
  return (
    parseInt(parts[0], 10) === year &&
    parseInt(parts[1], 10) === month + 1 &&
    parseInt(parts[2], 10) === day
  );
}

// Gera o calendário do mês atual
async function generateCalendar() {
  const calendarBody = document.getElementById("calendarBody");
  const monthNameEl = document.getElementById("monthName");
  if (!calendarBody || !monthNameEl) return;

  const roomId = document.getElementById("salas")?.value;
  const { data: agendamentos } = await getBookings(currentMonth, currentYear, roomId || undefined);
  const agendamentosList = agendamentos || [];

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const numDays = getDaysInMonth(currentMonth, currentYear);

  let html = "";
  let dayCount = 1;

  for (let row = 0; row < 6; row++) {
    html += "<tr>";
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;
      if (cellIndex < firstDay || dayCount > numDays) {
        html += "<td></td>";
      } else {
        const day = dayCount;
        const agendamentosDoDia = agendamentosList.filter(
          (a) => dateMatches(a.date, day, currentMonth, currentYear) && (roomId ? a.room_id == roomId : true)
        );
        const teacherName = (a) => (a.teachers && a.teachers.name) || "-";
        const MAX_VISIBLE = 2;
        const visible = agendamentosDoDia.slice(0, MAX_VISIBLE);
        const restCount = agendamentosDoDia.length - MAX_VISIBLE;
        const conteudoVisivel = visible
          .map(
            (a) => `<div class="agendamento-compact" data-id="${a.id}">
              <span class="agend-txt">${teacherName(a)} · ${a.period}</span>
              <span class="remove-agendamento" data-id="${a.id}">×</span>
            </div>`
          )
          .join("");
        const verMais =
          restCount > 0
            ? `<button type="button" class="btn-ver-mais" data-day="${day}" data-count="${agendamentosDoDia.length}">+${restCount} ver</button>`
            : "";
        const bookingsJson = JSON.stringify(agendamentosDoDia);

        html += `<td class="day-cell" data-day="${day}" data-bookings='${encodeURIComponent(bookingsJson)}'>
          <span class="day-number">${day}</span>
          <div class="agendamentos-inline">${conteudoVisivel}${verMais}</div>
        </td>`;
        dayCount++;
      }
    }
    html += "</tr>";
    if (dayCount > numDays) break;
  }

  calendarBody.innerHTML = html;
  monthNameEl.textContent = `${months[currentMonth]} ${currentYear}`;
}

// Selecionar ou desselecionar um dia
function selecionarDia(td) {
  if (!td || !td.classList.contains("day-cell")) return;
  const jaSelecionado = td.classList.contains("selected-day");
  document.querySelectorAll("#calendarBody .day-cell").forEach((d) => d.classList.remove("selected-day"));
  if (!jaSelecionado) td.classList.add("selected-day");
}

// Mudar o mês
function changeMonth(step) {
  currentMonth += step;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar();
}

// Confirma o agendamento
async function confirmarAgendamento() {
  const roomId = document.getElementById("salas")?.value;
  const period = document.getElementById("shift")?.value;
  const teacherId = document.getElementById("professor")?.value;
  const diaSelecionado = document.querySelector("#calendarBody .selected-day");

  if (!roomId || !period || !teacherId) {
    alert("Preencha todos os campos (sala, turno e professor) antes de agendar.");
    return;
  }

  if (!diaSelecionado) {
    alert("Selecione um dia no calendário.");
    return;
  }

  const day = parseInt(diaSelecionado.getAttribute("data-day"), 10);
  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const { data: agendamentosExistentes } = await getBookings(currentMonth, currentYear, roomId);

  const conflitoSala = (agendamentosExistentes || []).some(
    (a) => dateMatches(a.date, day, currentMonth, currentYear) && a.room_id == roomId && a.period === period
  );
  if (conflitoSala) {
    alert("Essa sala já está agendada para esse turno nesse dia.");
    return;
  }

  const { data: allBookings } = await getBookings(currentMonth, currentYear, null);
  const conflitoProfessor = (allBookings || []).some(
    (a) =>
      a.teacher_id == teacherId &&
      dateMatches(a.date, day, currentMonth, currentYear) &&
      a.period === period
  );
  if (conflitoProfessor) {
    alert("Esse professor já está agendado em outra sala nesse turno e dia.");
    return;
  }

  const novoBooking = {
    room_id: parseInt(roomId, 10),
    teacher_id: parseInt(teacherId, 10),
    date: dateStr,
    period,
  };

  const { error } = await createBooking(novoBooking);

  if (error) {
    console.error(error);
    alert("Erro ao salvar agendamento. Verifique a tabela 'bookings' no Supabase.");
    return;
  }

  alert("Agendamento salvo com sucesso!");
  diaSelecionado.classList.remove("selected-day");
  await generateCalendar();
}

// Remove um agendamento
async function removerAgendamento(id) {
  const { error } = await deleteBooking(id);
  if (error) {
    console.error(error);
    alert("Erro ao remover agendamento.");
    return;
  }
  await generateCalendar();
}
