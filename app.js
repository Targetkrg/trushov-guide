// Копирование произвольного текста в буфер обмена
async function copyText(btn, text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("✅ Скопировано в буфер обмена!");

    const orig = btn.innerHTML;
    btn.classList.add("copied");
    btn.innerHTML = "<span>✓ Скопировано в буфер!</span>";
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = orig;
    }, 2000);
  } catch (err) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast("✅ Скопировано!");
  }
}

// Копирование полного текста из указанного элемента (включая все строки подписи)
function copySnippet(elementId, btn) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  copyText(btn, text.trim());
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Автоматическое сохранение настроек напрямую на сервер бота
async function saveSettingsToServer() {
  const saveBtn = document.getElementById("save_btn");
  const origBtnHtml = saveBtn ? saveBtn.innerHTML : "";

  const adminId = document.getElementById("admin_id").value.trim();
  const courseTitle = document.getElementById("course_title").value.trim();
  const price = document.getElementById("course_price").value.trim();
  const kaspi = document.getElementById("kaspi_link").value.trim();
  const legalOwner = document.getElementById("legal_owner").value.trim();
  const duration = document.getElementById("access_duration").value;
  const support = document.getElementById("support_contact").value.trim();
  const refund = document.getElementById("refund_policy").value.trim();

  const benefits = [];
  document.querySelectorAll(".benefit-input").forEach(inp => {
    if (inp.value.trim()) benefits.push(inp.value.trim());
  });

  const payload = {
    admin_id: adminId,
    course_title: courseTitle,
    price: price,
    kaspi_link: kaspi,
    legal_owner: legalOwner,
    duration: duration,
    support: support,
    refund: refund,
    benefits: benefits
  };

  // Сохраняем в localStorage
  localStorage.setItem("trushov_guide_data", JSON.stringify(payload));

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = "<span>⏳ Сохранение и подключение к боту...</span>";
  }

  try {
    const res = await fetch("https://crm.leadsflow.kz/api/photo-course/save-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const resData = await res.json();

    if (res.ok && resData.ok) {
      document.getElementById("modal_title").textContent = "Настройки успешно применены! 🎉";
      document.getElementById("modal_text").innerHTML = 
        `Все реквизиты, цена и права администратора активированы прямо сейчас.<br><br>` +
        `<b>Курс:</b> ${courseTitle}<br>` +
        `<b>Цена:</b> ${price}<br>` +
        `<b>Админ ID:</b> ${adminId || '(не указан)'}<br><br>` +
        `✅ <b>Никому ничего пересылать не нужно!</b> Бот уже работает с этими данными. Теперь можно загружать видео уроков в канал «База».`;

      document.getElementById("modal_channel_btn").style.display = "block";
      document.getElementById("successModal").classList.add("active");
    } else {
      throw new Error(resData.error || "Ошибка сохранения");
    }
  } catch (err) {
    console.error("Save error:", err);
    showToast("⚠️ Ошибка сервера. Данные сохранены локально.");
    
    // В случае сбоя сети показываем модалку с подтверждением
    document.getElementById("modal_title").textContent = "Данные сохранены локально";
    document.getElementById("modal_text").innerHTML = 
      `Не удалось связаться с сервером напрямую (${err.message}).<br>` +
      `Проверьте подключение к интернету или нажмите кнопку ещё раз.`;
    document.getElementById("modal_channel_btn").style.display = "none";
    document.getElementById("successModal").classList.add("active");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = origBtnHtml;
    }
  }
}

function closeModal() {
  document.getElementById("successModal").classList.remove("active");
}

function loadSaved() {
  const saved = localStorage.getItem("trushov_guide_data");
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    if (data.admin_id) document.getElementById("admin_id").value = data.admin_id;
    if (data.course_title) document.getElementById("course_title").value = data.course_title;
    if (data.price) document.getElementById("course_price").value = data.price;
    if (data.kaspi_link) document.getElementById("kaspi_link").value = data.kaspi_link;
    if (data.legal_owner) document.getElementById("legal_owner").value = data.legal_owner;
    if (data.duration) document.getElementById("access_duration").value = data.duration;
    if (data.support) document.getElementById("support_contact").value = data.support;
    if (data.refund) document.getElementById("refund_policy").value = data.refund;
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  loadSaved();
});
