import { addRecipe, getAllRecipes, updateRecipe, deleteRecipeById } from './firestore.js';

const defaultImage = "default.png";
const form = document.getElementById('recipeForm');
const recipeList = document.getElementById('recipeList');
const search = document.getElementById('search');
const filterCategory = document.getElementById('filterCategory');
const previewImage = document.getElementById("previewImage");
const showFormBtn = document.getElementById("showFormBtn");
const clearSearch = document.getElementById("clearSearch");

// Показване/скриване на формата
showFormBtn.addEventListener("click", () => form.classList.toggle("show"));

// Зареждане на всички рецепти
async function loadAllRecipes() {
    const allRecipes = await getAllRecipes();
    const q = (search.value || "").toLowerCase();
    const selectedCategory = filterCategory.value;

    const filtered = allRecipes.filter(r => {
        const ingredientsArr = Array.isArray(r.ingredients) ? r.ingredients : String(r.ingredients).split(",").map(i => i.trim());
        const title = (r.title || "").toLowerCase();
        const ingredients = ingredientsArr.join(", ").toLowerCase();

        const matchesSearch = title.includes(q) || ingredients.includes(q);
        const matchesCategory = !selectedCategory || selectedCategory === "" || r.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    recipeList.innerHTML = "";
    filtered.forEach(r => {
        const ingredientsArr = Array.isArray(r.ingredients) ? r.ingredients : String(r.ingredients).split(",").map(i => i.trim());
        const stepsArr = Array.isArray(r.steps) ? r.steps : String(r.steps).split(".").map(s => s.trim());

        const div = document.createElement("div");
        div.className = "recipe";
        div.innerHTML = `
            <h3>${r.title}</h3>
            <p><b>Категория:</b> ${r.category}</p>
            <p><b>Съставки:</b> ${ingredientsArr.join(", ")}</p>
            <p><b>Стъпки:</b> ${stepsArr.join(". ")}</p>
            <img src="${r.image || defaultImage}" alt="${r.title}">
            <button onclick="handleDelete('${r.id}')">❌ Изтрий</button>
            <button onclick="handleEdit('${r.id}')">✏️ Редактирай</button>
        `;
        recipeList.appendChild(div);
    });
}

// Зареждане и попълване на категориите веднъж
async function initializeCategories() {
    const allRecipes = await getAllRecipes();
    const cats = [...new Set(allRecipes.map(r => r.category || "").filter(Boolean))];

    filterCategory.innerHTML = `<option value="">Всички категории</option>`;
    cats.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        filterCategory.appendChild(opt);
    });
}

// Функция за изтриване на рецепта
window.handleDelete = async (id) => {
    await deleteRecipeById(id);
    await loadAllRecipes();
};

// Функция за редакция на рецепта
window.handleEdit = async (id) => {
    const allRecipes = await getAllRecipes();
    const recipe = allRecipes.find(r => r.id === id);
    if (!recipe) return;

    document.getElementById("title").value = recipe.title;
    document.getElementById("category").value = recipe.category;
    document.getElementById("ingredients").value = (Array.isArray(recipe.ingredients) ? recipe.ingredients : String(recipe.ingredients).split(",").map(i => i.trim())).join(", ");
    document.getElementById("steps").value = (Array.isArray(recipe.steps) ? recipe.steps : String(recipe.steps).split(".").map(s => s.trim())).join(". ");

    form.dataset.editingId = recipe.id;
    form.dataset.editingImage = recipe.image || defaultImage;
    previewImage.src = recipe.image || defaultImage;
    previewImage.style.display = "block";
    form.classList.add("show");
};

// Обработка на формата
form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const file = document.getElementById("image")?.files?.[0];
    const reader = new FileReader();

    reader.onloadend = async function () {
        const existingImage = form.dataset.editingImage || defaultImage;
        const recipeData = {
            title: document.getElementById("title").value,
            category: document.getElementById("category").value,
            ingredients: document.getElementById("ingredients").value.split(",").map(i => i.trim()),
            steps: document.getElementById("steps").value.split(".").map(s => s.trim()),
            image: file ? reader.result : existingImage
        };

        if (form.dataset.editingId) {
            await updateRecipe(form.dataset.editingId, recipeData);
            delete form.dataset.editingId;
        } else {
            await addRecipe(recipeData);
        }

        form.reset();
        previewImage.src = "";
        previewImage.style.display = "none";
        delete form.dataset.editingImage;
        form.classList.remove("show");
        await loadAllRecipes();
    };

    if (file) reader.readAsDataURL(file);
    else reader.onloadend();
});

// Филтриране и търсене
search.addEventListener("input", loadAllRecipes);
filterCategory.addEventListener("change", loadAllRecipes);

clearSearch.addEventListener("click", () => {
    search.value = "";
    loadAllRecipes();
    clearSearch.style.display = "none";
});
search.addEventListener("input", () => {
    clearSearch.style.display = search.value ? "block" : "none";
});

// Първоначално зареждане на категории и рецепти
initializeCategories().then(loadAllRecipes);
