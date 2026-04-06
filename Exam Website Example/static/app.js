const API_URL = "https://oovlccqmrrlgyugolftk.supabase.co";
const API_KEY = "sb_publishable_gY1WW_-4TJtZMbLsiIySpA_jRWqN60l";

const SIGNUP_TABLE = "signup";
const ORDERS_TABLE = "orders";

const client = window.supabase 
? supabase.createClient(API_URL, API_KEY) 
: null;

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {

$("signup-form")?.addEventListener("submit", e=>{
e.preventDefault();
addUser();
});

$("loginForm")?.addEventListener("submit", handleLogin);

loadBasket();
loadCheckout();
loadRewards();

});


/* ========================
SIGNUP
======================== */

async function addUser(){

const UserEmail = $("UserEmail").value.trim();
const UserFirstName = $("UserFirstName").value.trim();
const UserLastName = $("UserLastName").value.trim();
const password = $("password").value.trim();
const confirmPassword = $("confirmPassword").value.trim();

if(!UserEmail || !UserFirstName || !UserLastName || !password || !confirmPassword){
alert("Please fill in all fields");
return;
}

if(password !== confirmPassword){
alert("Passwords do not match");
return;
}

if(password.length < 8){
alert("Password must be at least 8 characters");
return;
}

const body = {
useremail:UserEmail,
userfirstname:UserFirstName,
userlastname:UserLastName,
passwordhash:password,
reward_points:0
};

if(!client){
alert("Add Supabase keys");
return;
}

const { error } = await client
.from(SIGNUP_TABLE)
.insert([body]);

if(error){
alert("Could not create account");
return;
}

alert("Account Created");

$("signup-form").reset();

}


/* ========================
LOGIN
======================== */

async function handleLogin(e){

e.preventDefault();

const UserEmail = $("UserEmail").value.trim();
const password = $("password").value.trim();

if(!UserEmail.includes("@") || password.length < 8){
alert("Invalid login");
return;
}

const { data, error } = await client
.from(SIGNUP_TABLE)
.select("*")
.eq("useremail",UserEmail)
.eq("passwordhash",password)
.single();

if(error || !data){
alert("Incorrect login");
return;
}

localStorage.setItem("loggedInUser",JSON.stringify(data));
localStorage.setItem("basket",JSON.stringify([]));

window.location.href = "index.html";

}


/* ========================
BASKET
======================== */

function getBasket(){
return JSON.parse(localStorage.getItem("basket")) || [];
}

function saveBasket(basket){
localStorage.setItem("basket",JSON.stringify(basket));
}

function addToBasket(id,name,price){

const basket = getBasket();
const item = basket.find(i=>i.id===id);

item ? item.quantity++ : basket.push({id,name,price,quantity:1});

saveBasket(basket);

alert(name+" added");

}

function removeFromBasket(id){

saveBasket(getBasket().filter(i=>i.id!==id));

loadBasket();
loadCheckout();

}


/* ========================
LOAD BASKET
======================== */

function loadBasket(){

const basket = getBasket();
const items = $("basketItems");
const totalEl = $("basketTotal");
const countEl = $("basketCount");

if(!items) return;

if(!basket.length){
items.innerHTML="Basket empty";
return;
}

let total=0,count=0;

items.innerHTML = basket.map(i=>{

total+=i.price*i.quantity;
count+=i.quantity;

return `
<div class="feature-card">
<h3>${i.name}</h3>
<p>£${i.price}</p>
<p>Qty: ${i.quantity}</p>
<button onclick="removeFromBasket(${i.id})">
Remove
</button>
</div>
`;

}).join("");

totalEl.textContent=total.toFixed(2);
countEl.textContent=count;

}


/* ========================
CHECKOUT
======================== */

function loadCheckout(){

const basket = getBasket();
const items = $("checkoutItems");
const totalEl = $("checkoutTotal");
const pointsEl = $("pointsEarned");

if(!items) return;

let total = 0;

items.innerHTML = basket.map(i=>{

total += i.price * i.quantity;

return `
<div class="feature-card">
<h3>${i.name}</h3>
<p>Qty: ${i.quantity}</p>
</div>
`;

}).join("");

totalEl.textContent = total.toFixed(2);
pointsEl.textContent = Math.floor(total*10);

$("checkoutButton")?.addEventListener("click",completePurchase);

}


/* ========================
COMPLETE ORDER
======================== */

async function completePurchase(){

const basket = getBasket();
const user = JSON.parse(localStorage.getItem("loggedInUser"));

if(!basket.length){
alert("Basket empty");
return;
}

if(!user){
window.location.href="login.html";
return;
}

let total = basket.reduce((t,i)=>t+i.price*i.quantity,0);

const points = Math.floor(total*10);
const newPoints = (user.reward_points||0)+points;

if(client){

await client
.from(SIGNUP_TABLE)
.update({reward_points:newPoints})
.eq("useremail",user.useremail);

await client
.from(ORDERS_TABLE)
.insert([{userid:user.user_id,total:total}]);

}

user.reward_points=newPoints;

localStorage.setItem("loggedInUser",JSON.stringify(user));
localStorage.setItem("basket",JSON.stringify([]));

alert("Purchase complete");

window.location.href="rewards.html";

}


/* ========================
REWARDS
======================== */

function loadRewards(){

const el = $("rewardPoints");

if(!el) return;

const user = JSON.parse(localStorage.getItem("loggedInUser"));

el.textContent = user?.reward_points || 0;

}