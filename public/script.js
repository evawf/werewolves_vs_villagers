const loginDiv = document.getElementById("loginDiv");
const signupDiv = document.getElementById("signupDiv");

// User Sign Up
const signupBtn = document.getElementById("signupBtn");
signupBtn.addEventListener("click", () => {
  loginDiv.style.display = "none";
  signupDiv.style.display = "block";
});

const submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", async () => {
  const userData = {
    displayName: document.getElementById("display_name").value,
    email: document.getElementById("email_signup").value,
    password: document.getElementById("password_signup").value,
  };
  const result = await axios.post("/signup", userData);
  loginDiv.style.display = "block";
  signupDiv.style.display = "none";
});

// User Log In
const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", () => {
  const result = axios.get("/login");
});
