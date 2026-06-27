const intro = document.querySelector("#intro");
const skipIntro = document.querySelector("#skipIntro");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const popup = document.querySelector("#contactPopup");
const stopPopup = document.querySelector("#stopPopup");
const openPopupButtons = document.querySelectorAll("[data-open-popup]");
const closePopupButtons = document.querySelectorAll("[data-close-popup]");
const chatbot = document.querySelector("#chatbot");
const chatbotLaunch = document.querySelector("#chatbotLaunch");
const closeChatbot = document.querySelector("#closeChatbot");
const chatbotForm = document.querySelector("#chatbotForm");
const chatbotInput = document.querySelector("#chatbotInput");
const chatbotMessages = document.querySelector("#chatbotMessages");
const chatQuestionButtons = document.querySelectorAll("[data-chat-question]");

const POPUP_KEY = "shariqaPopupDisabled";
let popupTimer = null;

const siteAnswers = {
  menu:
    "Menu mein pizza, classic cheese burger, chicken tikka, paneer tikka, wraps/rolls, fries, sandwich, pasta, momos-style snacks, cold coffee aur shakes hain. Popular highlights: Loaded Pizza Rs. 199, Classic Cheese Burger Rs. 129, Chicken Tikka Rs. 179, Masala Fries Rs. 89.",
  order:
    "Order ke liye Contact Now button ya floating message icon dabaiye. Form mein name, phone, food item, quantity, needed by time, delivery/pickup address aur extra requirement bharni hoti hai.",
  address:
    "Address: 1498, Gli Qasim Jaan, Ballimaran, Delhi-110006.",
  phone:
    "Phone number: 9643528235. Aap top-right call button ya Contact section se direct call kar sakte hain.",
  email:
    "Contact form details sharixa393@gmail.com par jaati hain. Pehli baar FormSubmit confirmation email maang sakta hai.",
  timing:
    "Website par exact shop timing mention nahin hai. Quick order ya timing confirmation ke liye 9643528235 par call karna best rahega.",
  delivery:
    "Form mein delivery/pickup address field add hai. Complete address, landmark, quantity, time aur spice/sauce requirement likh kar submit karein.",
  catering:
    "Party ya catering order ke liye form mein 'Party or catering order' select karein, quantity, date/time, address aur guest count/requirements message mein likhein."
};

function getBotAnswer(question) {
  const text = question.toLowerCase();
  if (text.includes("address") || text.includes("location") || text.includes("pata") || text.includes("kahan")) {
    return siteAnswers.address;
  }
  if (text.includes("phone") || text.includes("number") || text.includes("call") || text.includes("mobile")) {
    return siteAnswers.phone;
  }
  if (text.includes("email") || text.includes("mail")) {
    return siteAnswers.email;
  }
  if (text.includes("order") || text.includes("book") || text.includes("mang") || text.includes("kaise")) {
    return siteAnswers.order;
  }
  if (text.includes("deliver") || text.includes("pickup") || text.includes("ghar") || text.includes("landmark")) {
    return siteAnswers.delivery;
  }
  if (text.includes("party") || text.includes("catering") || text.includes("bulk")) {
    return siteAnswers.catering;
  }
  if (text.includes("time") || text.includes("open") || text.includes("timing")) {
    return siteAnswers.timing;
  }
  if (text.includes("menu") || text.includes("pizza") || text.includes("burger") || text.includes("tikka") || text.includes("fries") || text.includes("price")) {
    return siteAnswers.menu;
  }
  return "Main website ke basis par bata sakta hoon: menu, order process, address, phone number, email, delivery/pickup details aur party order. Aap Contact Now se form bhi bhar sakte hain.";
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function hideIntro() {
  intro?.classList.add("hide");
  document.body.classList.remove("no-scroll");
}

function openPopup() {
  if (localStorage.getItem(POPUP_KEY) === "true") return;
  popup?.classList.add("show");
  popup?.setAttribute("aria-hidden", "false");
}

function closePopup() {
  popup?.classList.remove("show");
  popup?.setAttribute("aria-hidden", "true");
}

function startPopupLoop() {
  window.clearInterval(popupTimer);
  popupTimer = window.setInterval(openPopup, 30000);
}

if (intro) {
  document.body.classList.add("no-scroll");
  window.setTimeout(hideIntro, 2800);
  skipIntro?.addEventListener("click", hideIntro);
}

const activePage = document.body.dataset.page;
if (activePage) {
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const isActive =
      (activePage === "home" && href.includes("index.html")) ||
      href.includes(`${activePage}.html`);
    link.classList.toggle("active", isActive);
  });
}

navToggle?.addEventListener("click", () => {
  navLinks?.classList.toggle("open");
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

openPopupButtons.forEach((button) => {
  button.addEventListener("click", openPopup);
});

closePopupButtons.forEach((button) => {
  button.addEventListener("click", closePopup);
});

stopPopup?.addEventListener("click", () => {
  localStorage.setItem(POPUP_KEY, "true");
  closePopup();
  window.clearInterval(popupTimer);
});

function openChatbot() {
  chatbot?.classList.add("show");
  chatbot?.setAttribute("aria-hidden", "false");
}

function closeChatbotPanel() {
  chatbot?.classList.remove("show");
  chatbot?.setAttribute("aria-hidden", "true");
}

function addChatMessage(message, type) {
  const bubble = document.createElement("p");
  bubble.className = type === "user" ? "user-message" : "bot-message";
  bubble.textContent = message;
  chatbotMessages?.appendChild(bubble);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function askBot(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  addChatMessage(cleanQuestion, "user");
  window.setTimeout(() => addChatMessage(getBotAnswer(cleanQuestion), "bot"), 220);
}

chatbotLaunch?.addEventListener("click", openChatbot);
closeChatbot?.addEventListener("click", closeChatbotPanel);

chatQuestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openChatbot();
    askBot(button.dataset.chatQuestion || "");
  });
});

chatbotForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  askBot(chatbotInput.value);
  chatbotInput.value = "";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePopup();
    closeChatbotPanel();
    hideIntro();
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

window.addEventListener("load", () => {
  refreshIcons();
  if (localStorage.getItem(POPUP_KEY) !== "true") {
    window.setTimeout(openPopup, 30000);
    startPopupLoop();
  }
});
