const loginDiv = document.getElementById("loginDiv");
const signupDiv = document.getElementById("signupDiv");
const gameHallBtn = document.getElementById("gameHallBtn");
const signupBtn = document.getElementById("signupBtn");
const submitBtn = document.getElementById("submitBtn");
const loginBtn = document.getElementById("loginBtn");

// Check if user has logged in
function getCookie(cName) {
  const name = cName + "=";
  const cDecoded = decodeURIComponent(document.cookie); //to be careful
  const cArr = cDecoded.split("; ");
  let res;
  cArr.forEach((val) => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  });
  return res;
}

const checkIsLoggedIn = () => {
  const isLoggedIn = getCookie("loggedIn");
  const isUserId = getCookie("userId");
  if (isLoggedIn) {
    gameHallBtn.style.display = "block";
    loginDiv.style.display = "none";
    signupDiv.style.display = "none";
  }
};

// User Log In
loginBtn.addEventListener("click", async () => {
  const userData = {
    email: document.getElementById("email_login").value,
    password: document.getElementById("password_login").value,
  };
  const result = await axios.post("/login", userData);
  if (
    result.data !== "Wrong password! Please try again!" ||
    result.data !== "User is not found, please sign up first!"
  ) {
    loginDiv.style.display = "none";
    signupDiv.style.display = "none";
    gameHallBtn.style.display = "block";
  }
  console.log(result.data);
});

// User Sign Up
signupBtn.addEventListener("click", () => {
  loginDiv.style.display = "none";
  signupDiv.style.display = "block";
});

submitBtn.addEventListener("click", async () => {
  const userData = {
    displayName: document.getElementById("display_name").value,
    email: document.getElementById("email_signup").value,
    password: document.getElementById("password_signup").value,
  };
  const result = await axios.post("/signup", userData);
  if (result.data !== "Existing user!") {
    loginDiv.style.display = "block";
    signupBtn.style.display = "none";
    signupDiv.style.display = "none";
  } else {
    console.log(result.data);
  }
});

checkIsLoggedIn();
