// firestore.js

// Импорти от Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.5/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/9.6.5/firebase-firestore.js";

// Конфигурация на Firebase
// apiKey се подава чрез GitHub Secret
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY, // <- тук използваме secret ключа
  authDomain: "recipesbook-dd53e.firebaseapp.com",
  projectId: "recipesbook-dd53e",
  storageBucket: "recipesbook-dd53e.firebasestorage.app",
  messagingSenderId: "895708619851",
  appId: "1:895708619851:web:bbfa6ceb59396c862859ce"
};

// Инициализация на Firebase
const app = initializeApp(firebaseConfig);

// Инициализация на Firestore
const db = getFirestore(app);

// Колекцията с рецепти
const recipesCollection = collection(db, "recipes");

// Функции за работа с Firestore

// Добавяне на рецепта
export async function addRecipe(recipe) {
  try {
    const docRef = await addDoc(recipesCollection, recipe);
    console.log("Рецепта добавена с ID: ", docRef.id);
  } catch (e) {
    console.error("Грешка при добавяне: ", e);
  }
}

// Вземане на всички рецепти
export async function getAllRecipes() {
  try {
    const querySnapshot = await getDocs(recipesCollection);
    const recipes = [];
    querySnapshot.forEach((doc) => {
      recipes.push({ id: doc.id, ...doc.data() });
    });
    return recipes;
  } catch (e) {
    console.error("Грешка при извличане на рецепти: ", e);
    return [];
  }
}

// Редакция на рецепта
export async function updateRecipe(id, updatedData) {
  try {
    const recipeDoc = doc(db, "recipes", id);
    await updateDoc(recipeDoc, updatedData);
  } catch (e) {
    console.error("Грешка при редакция: ", e);
  }
}

// Изтриване на рецепта
export async function deleteRecipeById(id) {
  try {
    const recipeDoc = doc(db, "recipes", id);
    await deleteDoc(recipeDoc);
  } catch (e) {
    console.error("Грешка при изтриване: ", e);
  }
}
