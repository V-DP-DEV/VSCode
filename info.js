let obj; //add search pokemon to top//change the input box to a select element maybe?//do more error handling
let obj2; 

const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");

const pokemonName = document.getElementById("pokemon");
const description = document.getElementById("description");
const weight = document.getElementById("weight");
const height = document.getElementById("height");
const generation = document.getElementById("generation");
const types = document.getElementById("types");
const frontImg = document.getElementById("frontImage");
const backImg = document.getElementById("backImage");

const battleStats = document.getElementById("battleStats");
const trainingStats = document.getElementById("trainingStats");
const breedingStats = document.getElementById("breedingStats")

const femaleLabel = breedingStats.rows[3].cells[1].children[1];
const maleLabel = breedingStats.rows[3].cells[1].children[0];
const genderlessLabel = breedingStats.rows[3].cells[1].children[2];

const abilityTable = document.getElementById("ability_table");

const evolves_from = document.getElementById("evolves_from")

let maleIntervalId;
let shinyIntervalId;

let tempType = document.createElement("label");
tempType.classList.add('types')

loadDataIntoElements(getQueryParm("id"))

function getQueryParm(parm){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parm);  // Returns the value of the parameter
}

searchButton.addEventListener("click", async function(){
    text = searchInput.value;
    loadDataIntoElements(text.toLowerCase());
});

//GET DATA OF POKEMON
async function getPokemonData(name){
    const res = await fetch("https://pokeapi.co/api/v2/pokemon/"+name);
    const obj = await res.json();
    return obj
}

function getEnglishStr(object){
    for(let i = 0; i < object.length ; i++){
        if (object[i].language.name == "en"){return i;}
    }
}

function extract(description){
    let newText = description.split("\n").join(" ");
    newText = newText.split("\f").join(" ");
    return newText;
}

//DISPLAY DATA OF

async function loadDataIntoElements(nameOrId){
    clearData();
    obj = await getPokemonData(nameOrId);
    const res = await fetch("https://pokeapi.co/api/v2/pokemon-species/"+ obj.id+"/");
    obj2 = await res.json();
    console.log(obj);
    console.log(obj2);

    let name = obj.species.name[0].toUpperCase()+obj.species.name.substr(1,obj.species.name.length);

    pokemonName.innerHTML = name + " #"+obj.id;
    description.innerHTML = "Description: "+ extract(obj2.flavor_text_entries[getEnglishStr(obj2.flavor_text_entries)].flavor_text);
    weight.innerHTML = "Weight: "+ (obj.weight/10) + " kg";
    height.innerHTML = "Height: " + (obj.height/10) + " m";
    generation.innerHTML = "Added in " + obj2.generation.name
    addTypes()
    maleIntervalId = rotateBetweenImages(obj.sprites.front_default,obj.sprites.front_shiny,frontImg)
    shinyIntervalId =rotateBetweenImages(obj.sprites.back_default,obj.sprites.back_shiny,backImg)

    //battle stats
    battleStats.rows[1].cells[1].innerHTML = obj.stats[0].base_stat
    battleStats.rows[2].cells[1].innerHTML = obj.stats[1].base_stat
    battleStats.rows[3].cells[1].innerHTML = obj.stats[2].base_stat
    battleStats.rows[4].cells[1].innerHTML = obj.stats[3].base_stat
    battleStats.rows[5].cells[1].innerHTML = obj.stats[4].base_stat
    battleStats.rows[6].cells[1].innerHTML = obj.stats[5].base_stat
    battleStats.rows[7].cells[1].innerHTML = (obj.stats[0].base_stat+ obj.stats[1].base_stat + obj.stats[2].base_stat + obj.stats[3].base_stat + obj.stats[4].base_stat + obj.stats[5].base_stat)

    trainingStats.rows[1].cells[1].innerHTML =  obj2.capture_rate
    trainingStats.rows[2].cells[1].innerHTML = obj2.growth_rate.name
    trainingStats.rows[3].cells[1].innerHTML = obj2.base_happiness
    trainingStats.rows[4].cells[1].innerHTML = obj.base_experience
    
    breedingStats.rows[2].cells[1].innerHTML = obj2.hatch_counter;
    setGender();
    addAbilities();
    addEvulotionChain();
}

function setGender(){
    let rate = obj2.gender_rate;

    maleLabel.innerHTML = "";
    femaleLabel.innerHTML = "";
    genderlessLabel.innerHTML = "";

    if (rate == -1){
        genderlessLabel.innerHTML = "Genderless";
    }
    else{
        maleLabel.innerHTML = ((8 - rate)*12.5) + "% male";
        femaleLabel.innerHTML = (rate*12.5)+ "% female  "
    }
}

function clearData(){
    deleteAbilities();
    if(maleIntervalId != null){clearInterval(maleIntervalId)}
    if(shinyIntervalId != null){clearInterval(shinyIntervalId)}
    types.innerHTML = "";
    evolves_from.innerHTML = "";
}

async function addAbilities(){
    for(let i = 0; i < obj.abilities.length; i++){
        let row = abilityTable.insertRow(-1);
        let cel1 = row.insertCell(-1);
        let cel2 = row.insertCell(-1);
        const res = await fetch(obj.abilities[i].ability.url);
        ability = await res.json();
        cel1.innerHTML = ability.name;
        cel2.innerHTML = ability.effect_entries[getEnglishStr(ability.effect_entries)].short_effect;
    }
}

async function addEvulotionChain(){
    const res = await fetch(obj2.evolution_chain.url);
    let evoChain = await res.json();
    console.log("Evolutions")
    //console.log(targetName);
    addEvolvesFrom();
    console.log(getTargetInEvoChain(evoChain.chain));
}

function addEvolvesFrom(){
    if (obj2.evolves_from_species != null){
        console.log(obj2.evolves_from_species.name) 
        let block = tempBlock.cloneNode(true);
        loadPokemonIntoBlock(obj2.evolves_from_species.name,block);
        evolves_from.appendChild(block);
    }
}

function addEvolvesTo(){

}

function getTargetInEvoChain(beginPokemon){
    let targetName = obj.name;
    if (targetName == beginPokemon.species.name){
        return beginPokemon;
    }
    for (let i = 0; i < beginPokemon.evolves_to.length;i++){
        recursiveResult = getTargetInEvoChain(beginPokemon.evolves_to[i]);
        if (recursiveResult != null){
            return recursiveResult;
        }
    }
    return null;
}

function deleteAbilities(){
    let length = abilityTable.rows.length;
    for(let i = 1; i < length; i++ ){abilityTable.deleteRow(1)}
}

function addTypes(){
    for (let i = 0; i < obj.types.length; i++) {
        let type = tempType.cloneNode(true);
        type.innerHTML = obj.types[i].type.name;
        type.classList.add(obj.types[i].type.name)
        types.appendChild(type);
    }
    if(obj2.is_legendary){
        let type = tempType.cloneNode(true);
        type.innerHTML = "legendary";
        type.classList.add('legendary')
        types.appendChild(type);
    }
    if(obj2.is_mythical){
        let type = tempType.cloneNode(true);
        type.innerHTML = "mythical";
        type.classList.add('mythical')
        types.appendChild(type);
    }
}

function rotateBetweenImages(normalImg, shinyImg, imgElement){
    if (normalImg == null || shinyImg == null){
        imgElement.style.width = "0px";
        return;
    }
    else{
        imgElement.style.width = "150px"
    }
    imgElement.src = normalImg;
    id = setInterval(function(){
        if(imgElement.src == normalImg){
            imgElement.src = shinyImg;
        }
        else{
            imgElement.src = normalImg;
        }
    },4000);
    return id;
}