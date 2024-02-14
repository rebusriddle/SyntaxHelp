// Run the init() function when the page has loaded
window.addEventListener('DOMContentLoaded', init);

var selectedSpriteIndex;
var currentLine = 0;
var characters = {};

const SPRITE_ID = 0;
const SPRITE_EMOTION = 1;
const SPRITE_SRC = 2;

const LINE_NAME = 0;
const LINE_SPRITE = 1;
const LINE_DIALOGUE = 2;

// Starts the program, all function calls trace back here
function init() {
    generateDataInputListeners();
}


function generateDataInputListeners() {
    let form = document.getElementById("assetForm");
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        let lines = document.getElementById('assetInput').value;

        //alert for empty script input
        if(lines == "") {
            window.alert("Asset input is empty!");
            return;
        }

        //parses content of scriptInput into lineArray
        let charArray = parseAssetData(lines);

        let assetSubmit = document.getElementById('assetSubmit');
        assetSubmit.value = "SUCCESS!";

        generateScriptInputListeners(charArray);
    })
}

function parseAssetData(lines) {
    let charArray = [];
    let currChara = -1;
    //splits each line into array
    let allLines = lines.split("\n");
    for(let i = 0; i < allLines.length; i++) {
        if(allLines[i].slice(0,2) == "**") {
            currChara++;
            //gets character name and saves it
            let charaName = allLines[i].slice(2, allLines[i].length);
            characters[charaName] = currChara;
            let array = [];
            charArray.push(array);
            continue;
        }

        let currLine = allLines[i].split(",");
        //if the length of currLine < 2, that means currLine does not follow the format NAME: DIALOGUE
        if(currLine.length < 3) {
            continue;
        }

        charArray[currChara].push([currLine[SPRITE_ID], currLine[SPRITE_EMOTION], currLine[SPRITE_SRC]]);
    } //end for loop

    return charArray;
}

/**
 * Generates functionality for the script input submit button
 * and also calls the functions necessary to build the rest of the page
 */
function generateScriptInputListeners(charArray) {
    let form = document.getElementById("scriptForm");
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        let lines = document.getElementById('scriptInput').value;

        //alert for empty script input
        if(lines == "") {
            window.alert("Script input is empty!");
            return;
        }

        //parses content of scriptInput into lineArray
        let lineArray = parseLines(lines);

        //generates the list of dialogue beneath the sprites
        generateDialogueLines(charArray, lineArray);

        let sprites = loadSprite(charArray, lineArray[0][LINE_NAME]);
        
        //generates the sprite lineup
        generateFlexHTML(sprites);

        //generates functionality for the sprite lineup
        generateFlexListeners(sprites, lineArray);

        currentLine = 0;

        //generates nav buttons 
        generatePrevNextButtons(charArray, lineArray);

        generateCopyListener(lineArray);

        let scriptSubmit = document.getElementById('scriptSubmit');
        scriptSubmit.value = "SUCCESS!";
    })
}

/**
 * Parses the entered script into a 2D array, where each entry in the
 * array is a size 3 array of the form [Character Name, Character Sprite ID, Current Line Dialogue]
 * @param {*} lines 
 * @returns lineArray 
 */
function parseLines(lines){
    let lineArray = [];

    //splits each line into array
    let allLines = lines.split("\n");

    //loop through every line of dialogue
    var validLineIndex = 0;
    for(let i = 0; i < allLines.length; i++) {
        let currLine = allLines[i].split(":");
        //if the length of currLine < 2, that means currLine does not follow the format NAME: DIALOGUE
        if(currLine.length < 2) {
            //valid comment line
            if(currLine[0].slice(0,2) == "//") {
                console.log("Comment detected:" + currLine[0]);
                lineArray[validLineIndex] = ["Comment", "NA", currLine[0]];
                validLineIndex++;
                continue;
            }
            else {
                continue;
            }
        }

        let identifier = currLine[0].split("/");
        //if the length of identifier < 2, that means there is no sprite currently assigned
        if(identifier.length < 2) {
            lineArray[validLineIndex] = [identifier[LINE_NAME], "NA", currLine[1]];
        }
        else {
            lineArray[validLineIndex] = [identifier[LINE_NAME], identifier[LINE_SPRITE], currLine[1]];
        }

        //validLineIndex: only lines that successfully pass the currLine < 2 check are numbered continuously
        validLineIndex++;
    }

    return lineArray;
}

/**
 * Generates HTML for all dialogue lines
 * @param {*} lineArray 
 */
function generateDialogueLines(charArray, lineArray) {
    let dialogueLines = document.getElementById("dialogueLines");
    for(let i = 0; i < lineArray.length; i++) {
        if(lineArray[i][LINE_NAME] == "Comment") {
            dialogueLines.innerHTML += `
            <div id="dialogue_${i}" class="unselectedLine">
                <b>LINE ${i}</b> | ${lineArray[i][LINE_DIALOGUE]}
            </div><br>`;
        }
        else if(lineArray[i][LINE_SPRITE] == ("NA")) {
            dialogueLines.innerHTML += `
            <div id="dialogue_${i}" class="unselectedLine">
                <b>LINE ${i}</b> | ${lineArray[i][LINE_NAME]}: ${lineArray[i][LINE_DIALOGUE]}
            </div><br>`;
        }
        else {
            dialogueLines.innerHTML += `
            <div id="dialogue_${i}" class="unselectedLine">
                <b>LINE ${i}</b> | ${lineArray[i][LINE_NAME]}/${lineArray[i][LINE_SPRITE]}: ${lineArray[i][LINE_DIALOGUE]}
            </div><br>`;
        }
    } //end for

    generateDialogueListeners(charArray, lineArray);
}

function generateDialogueListeners(charArray, lineArray) {
    for(let i = 0; i < lineArray.length; i++) {
        let currentDialogue = document.getElementById(`dialogue_${i}`);
        currentDialogue.addEventListener('click', () => {
            if(currentDialogue.classList.contains("selectedLine")) { //selected
                return;
            } else { //unselected

                navigateLine(i, charArray, lineArray);
            }
        }); //end event listener

    } //end for

    //set first line to selected
    let firstLine = document.getElementById(`dialogue_0`);
    firstLine.classList.remove("unselectedLine");
    firstLine.classList.add("selectedLine");
    currentLine = 0;
}


/**
 * Uses an array of sprite srcs and names to generate HTML for the line of sprites
 * @param {*} sprites Array of sprites
 * @returns The HTML used to generate the "line of sprites" part of the webpage
 */
function generateFlexHTML(sprites) {
    let flexHTML = ``;
    for(let i = 0; i < sprites.length; i++) {
        flexHTML += `
        <div id="nameandsprite_${i}" class="unselectedSprite">
            <div class="spritename">${sprites[i][SPRITE_ID]}: ${sprites[i][SPRITE_EMOTION]}</div>
            <img src="${sprites[i][SPRITE_SRC]}" alt="spriteimg_${i}">
        </div>`;
    }
    let flex = document.getElementById("flex");
    flex.innerHTML = flexHTML;
}

/**
 * Makes each sprite be selectable, changing the background color of the image and the
 * sprite code used in the top line
 * @param {*} sprites 
 * @param {*} lineArray 
 */
function generateFlexListeners(sprites, lineArray) {

    //if the last character to speak is the same as the current character to speak
    //then the 0 sprite is shown with the last emotion and SRC
    if(currentLine != 0 && lineArray[currentLine][LINE_NAME] != "Comment") {

        let validZeroSequence = false;
        //goes back to the most recent line that is not 0
        let x = 0;
        while(currentLine - x >= 1) {
            x++;
            
            //if it is a comment, continue
            if(lineArray[currentLine-x][LINE_NAME] == "Comment") {
                continue;
            }
            //if it is still 0, continue
            else if(lineArray[currentLine-x][LINE_SPRITE] == "0") {
                continue;
            }
            //same name and sprite, end
            else if (lineArray[currentLine-x][LINE_SPRITE] != "0" && lineArray[currentLine-x][LINE_NAME] == lineArray[currentLine][LINE_NAME]) {
                validZeroSequence = true;
                break;
            }
            else if(lineArray[currentLine-x][LINE_NAME] != lineArray[currentLine][LINE_NAME]) {
                break;
            }  
        }
        let lastSpriteId;
        let lastSpriteEmotion;
        let lastSpriteSrc;
        
        if(validZeroSequence) {
            lastSpriteId = lineArray[currentLine-x][LINE_SPRITE];
            //find the src of the last sprite
            for(let i = 0; i < sprites.length; i++) {
                if(sprites[i][SPRITE_ID] == lastSpriteId) {
                    lastSpriteEmotion = sprites[i][SPRITE_EMOTION];
                    lastSpriteSrc = sprites[i][SPRITE_SRC];
                    break;
                }
           }
            lastSpriteId += ": ";
            sprites[0][SPRITE_EMOTION] = lastSpriteEmotion;
            sprites[0][SPRITE_SRC] = lastSpriteSrc;
        }
        else {
            lastSpriteEmotion = "Null";
            lastSpriteSrc = "https://cdn.discordapp.com/attachments/1054648049214959630/1054662730394636338/nospritefound.png";
            lastSpriteId = "";
            sprites[0][SPRITE_EMOTION] = lastSpriteEmotion;
            sprites[0][SPRITE_SRC] = lastSpriteSrc;
        }
        
        
        let spriteObject = document.getElementById(`nameandsprite_0`);
        spriteObject.innerHTML = `
        <div class="spritename">0: ${lastSpriteId}${lastSpriteEmotion}</div>
        <img src="${lastSpriteSrc}" alt="spriteimg_0">`

        spriteObject.addEventListener('click', () => {
            //only one sprite can be selected
            if(spriteObject.classList.contains("selectedSprite")) { //selected
                return;
            } else { //unselected
                //current selected sprite is unselected
                let selectedObject = document.getElementById(`nameandsprite_${selectedSpriteIndex}`);
                selectedObject.classList.add("unselectedSprite");
                selectedObject.classList.remove("selectedSprite");

                //the sprite you clicked on is selected
                spriteObject.classList.remove("unselectedSprite");
                spriteObject.classList.add("selectedSprite");
                selectedSpriteIndex = 0;

                //set the sprite in the lineArray
                lineArray[currentLine][LINE_SPRITE] = 0;
                generateTopLine(lineArray[currentLine]);

                //update line of dialogue (WHEN A SPRITE IS SELECTED)
                updateDialogueLine(lineArray, currentLine);
            }
        }) //end add eventListener
    } //end if statement for 0 sprite
    //otherwise, USE AT YOUR OWN RISK!
    else {
        if(lineArray[currentLine][LINE_NAME] == "Comment") {
            sprites[0][SPRITE_EMOTION] = "ThisIsAComment";
        }
        else {
            sprites[0][SPRITE_EMOTION] = "Null";
        }
        sprites[0][SPRITE_SRC] = 'https://cdn.discordapp.com/attachments/1054648049214959630/1054662730394636338/nospritefound.png';
        let nullObject = document.getElementById("nameandsprite_0");
        nullObject.innerHTML = `
        <div class="spritename">0: ${sprites[0][SPRITE_EMOTION]}</div>
        <img src=${sprites[0][SPRITE_SRC]} alt="spriteimg_0">`
        nullObject.addEventListener('click', () => {
            //only one sprite can be selected
            if(nullObject.classList.contains("selectedSprite")) { //selected
                return;
            } else { //unselected
                //current selected sprite is unselected
                let selectedObject = document.getElementById(`nameandsprite_${selectedSpriteIndex}`);
                selectedObject.classList.add("unselectedSprite");
                selectedObject.classList.remove("selectedSprite");

                //the sprite you clicked on is selected
                nullObject.classList.remove("unselectedSprite");
                nullObject.classList.add("selectedSprite");
                selectedSpriteIndex = 0;

                //set the sprite in the lineArray
                lineArray[currentLine][LINE_SPRITE] = 0;
                generateTopLine(lineArray[currentLine]);

                //update line of dialogue (WHEN A SPRITE IS SELECTED)
                updateDialogueLine(lineArray, currentLine);
            }
        })
    }


    //Goes through every sprite except 0 and adds eventListener to them
    for(let i = 1; i < sprites.length; i++) {
        let spriteObject = document.getElementById(`nameandsprite_${i}`);

        spriteObject.addEventListener('click', () => {
            //only one sprite can be selected
            if(spriteObject.classList.contains("selectedSprite")) { //selected
                return;
            } else { //unselected
                //current selected sprite is unselected
                let selectedObject = document.getElementById(`nameandsprite_${selectedSpriteIndex}`);
                selectedObject.classList.add("unselectedSprite");
                selectedObject.classList.remove("selectedSprite");

                //the sprite you clicked on is selected
                spriteObject.classList.remove("unselectedSprite");
                spriteObject.classList.add("selectedSprite");
                selectedSpriteIndex = i;

                //set the sprite in the lineArray
                lineArray[currentLine][LINE_SPRITE] = sprites[selectedSpriteIndex][SPRITE_ID];
                generateTopLine(lineArray[currentLine]);

                //update line of dialogue (WHEN A SPRITE IS SELECTED)
                updateDialogueLine(lineArray, currentLine);
            }
        }) //end add eventListener
    } //end for loop of all sprites

    //Set first sprite to selected only IF there is no sprite selected
    if(lineArray[currentLine][LINE_NAME] == "Comment") {
        let firstObject = document.getElementById(`nameandsprite_0`);
        firstObject.classList.remove("unselectedSprite");
        firstObject.classList.add("selectedSprite");
        selectedSpriteIndex = 0;
        lineArray[currentLine][LINE_SPRITE] = sprites[selectedSpriteIndex][SPRITE_ID];
        generateTopLine(lineArray[currentLine]);
        updateDialogueLine(lineArray, currentLine);
    }
    else if(lineArray[currentLine][LINE_SPRITE] == "NA") {
        let firstObject = document.getElementById(`nameandsprite_1`);
        firstObject.classList.remove("unselectedSprite");
        firstObject.classList.add("selectedSprite");
        selectedSpriteIndex = 1;
        lineArray[currentLine][LINE_SPRITE] = sprites[selectedSpriteIndex][SPRITE_ID];
        generateTopLine(lineArray[currentLine]);
        updateDialogueLine(lineArray, currentLine);
    }
    else {
        let selectedSpriteId = lineArray[currentLine][LINE_SPRITE];
        //find the id of the selected sprite
        for(let i = 0; i < sprites.length; i++) {
            if(sprites[i][SPRITE_ID] == selectedSpriteId) {
                let selectedObject = document.getElementById(`nameandsprite_${i}`);
                selectedObject.classList.remove("unselectedSprite");
                selectedObject.classList.add("selectedSprite");
                selectedSpriteIndex = i;
                generateTopLine(lineArray[currentLine]);
                updateDialogueLine(lineArray, currentLine);
                break;
            }
        }//end for
    } //end else
}


/**
 * Generates buttons to navigate lines and dialogue
 */
function generatePrevNextButtons(charArray, lineArray) {
    let prevButton = document.getElementById("prevButton");
    prevButton.innerHTML = "<<";
    prevButton.addEventListener('click', () => {
        if(prevButton.classList.contains("valid")) {
            navigateLine(currentLine - 1, charArray, lineArray);
        }
    })

    let nextButton = document.getElementById("nextButton");
    nextButton.innerHTML = ">>";
    nextButton.addEventListener('click', () => {
        if(nextButton.classList.contains("valid")) {
            navigateLine(currentLine + 1, charArray, lineArray);
        }
    })

    if(currentLine == 0) {
        prevButton.classList.add("invalid");
        prevButton.classList.remove("valid");
    }

    if(currentLine == lineArray.length - 1) {
        nextButton.classList.add("invalid");
        nextButton.classList.remove("valid");
    }
}

/**
 * Generates the top line of the syntaxer; called every time a new sprite is selected
 * @param {*} sprites 
 */
function generateTopLine(currArray) {
    let topLine = document.getElementById("topLine");
    
    if(currArray[LINE_NAME] == ("Comment")) {
        topLine.innerHTML = `
            <div id="linenumber">Line ${currentLine}</div>
            <div id="linescript">${currArray[LINE_DIALOGUE]}</div>
        `
    }
    //if there is no sprite currently set, there will be no / after the chara name
    else if(currArray[LINE_SPRITE] == ("NA")) {
        topLine.innerHTML = `
            <div id="linenumber">Line ${currentLine}</div>
            <div id="linescript">${currArray[LINE_NAME]}: ${currArray[LINE_DIALOGUE]}</div>
        `
    }
    //if there is a sprite set
    else {
        topLine.innerHTML = `
            <div id="linenumber">Line ${currentLine}</div>
            <div id="linescript">${currArray[LINE_NAME]}/${currArray[LINE_SPRITE]}: ${currArray[2]}</div>
        `
    }
    
    let header = document.getElementById("header");
    header.style.display = "none";
    let assetForm = document.getElementById("assetForm");
    assetForm.style.display = "none";
    let scriptForm = document.getElementById("scriptForm");
    scriptForm.style.display = "none";
}

/**
 * Updates a specific bottom dialogueLine's sprites
 * @param {*} lineArray 
 * @param {*} currentLine 
 */
function updateDialogueLine(lineArray, currentLine) {
    let dialogueObject = document.getElementById(`dialogue_${currentLine}`);
    if(lineArray[currentLine][LINE_NAME] == "Comment") {
        dialogueObject.innerHTML = 
        `<b>LINE ${currentLine}</b> | ${lineArray[currentLine][LINE_DIALOGUE]}`;
    }
    else if(lineArray[currentLine][LINE_SPRITE] == ("NA")) {
        dialogueObject.innerHTML = 
        `<b>LINE ${currentLine}</b> | ${lineArray[currentLine][LINE_NAME]}: ${lineArray[currentLine][LINE_DIALOGUE]}`;
    }
    else {
        dialogueObject.innerHTML = 
        `<b>LINE ${currentLine}</b> | ${lineArray[currentLine][LINE_NAME]}/${lineArray[currentLine][LINE_SPRITE]}: ${lineArray[currentLine][LINE_DIALOGUE]}`;
    }
}

/**
 * Switches the site to a different line
 * @param {*} line 
 * @param {*} lineArray 
 */
function navigateLine(line, charArray, lineArray) {

    //update dialogue objects
    let selectedDialogue = document.getElementById(`dialogue_${currentLine}`);
    selectedDialogue.classList.add("unselectedLine");
    selectedDialogue.classList.remove("selectedLine");

    //the line you clicked on is selected
    let currentDialogue = document.getElementById(`dialogue_${line}`);
    currentDialogue.classList.remove("unselectedLine");
    currentDialogue.classList.add("selectedLine");

    //sets currentLine
    currentLine = line;
    selectedSpriteIndex = 0;

    let sprites = loadSprite(charArray, lineArray[line][LINE_NAME]);

    //update flexHTML
    generateFlexHTML(sprites);

    //update flex listeners
    generateFlexListeners(sprites, lineArray);

    //update validity of navButtons
    if(currentLine == 0) {
        prevButton.classList.add("invalid");
        prevButton.classList.remove("valid");
    }
    else if(currentLine != 0 && prevButton.classList.contains("invalid")) {
        prevButton.classList.add("valid");
        prevButton.classList.remove("invalid");
    }

    if(currentLine == lineArray.length - 1) {
        nextButton.classList.add("invalid");
        nextButton.classList.remove("valid");
    }
    else if((currentLine != lineArray.length - 1) && nextButton.classList.contains("invalid")) {
        nextButton.classList.add("valid");
        nextButton.classList.remove("invalid");
    }
}

/**
 * Gets the correct sprite array from a charArray based on a character name
 * @param {*} charArray 
 * @param {*} name 
 */
function loadSprite(charArray, name) {

    if(!(characters.hasOwnProperty(name))) {
        let sprites = [];
        sprites.push(["0","Null","https://cdn.discordapp.com/attachments/1054648049214959630/1054662730394636338/nospritefound.png"]);
        sprites.push(["404","DoNotSelectThis","https://cdn.discordapp.com/attachments/1054648049214959630/1054952850431688805/charanotfound.png"]);
        return sprites;
    }

    let sprites = charArray[characters[name]];
    return sprites;
}

function generateCopyListener(lineArray) {
    let copyButton = document.getElementById("copyButton");
    copyButton.innerHTML =
        `<button id="copyHere">Copy</button>`;
    
    let copyHere = document.getElementById("copyHere");
    copyHere.addEventListener('click', () => {
        let copyString = "";
        for(let i = 0; i < lineArray.length; i++) {
            if(lineArray[i][LINE_NAME] == "Comment") {
                copyString += lineArray[i][LINE_DIALOGUE] + "\n";
            }
            else if(lineArray[i][LINE_SPRITE] == "NA") {
                copyString += lineArray[i][LINE_NAME] + ":" +
                lineArray[i][LINE_DIALOGUE] + "\n";
            }
            else {
                copyString += lineArray[i][LINE_NAME] + "/" + 
                lineArray[i][LINE_SPRITE] + ":" +
                lineArray[i][LINE_DIALOGUE] + "\n";
            }
        } //end for
        copyHere.innerHTML = "COPIED!";
        navigator.clipboard.writeText(copyString);
    });
}
