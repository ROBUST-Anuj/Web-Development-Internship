const form = document.getElementById("contactForm");
const statusMessage = document.getElementById("statusMessage");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    statusMessage.textContent = "⚠️ Please fill in all fields.";
    statusMessage.style.color = "red";
    statusMessage.style.display = "block";
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    statusMessage.textContent = "❌ Invalid email format.";
    statusMessage.style.color = "red";
    statusMessage.style.display = "block";
    return;
  }

  statusMessage.textContent = "✅ Message sent successfully!";
  statusMessage.style.color = "green";
  statusMessage.style.display = "block";
  form.reset();

  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 3000);
});
