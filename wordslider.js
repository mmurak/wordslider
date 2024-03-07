class GlobalManager {
	constructor() {
		this.commandArea = document.getElementById("CommandArea");
//		this.cursorVisible = document.getElementById("CursorVisible");
		this.buttonRed = document.getElementById("ButtonRed");
		this.buttonGreen = document.getElementById("ButtonGreen");
		this.buttonBlue = document.getElementById("ButtonBlue");
		this.textDialog = document.getElementById("TextDialog");
		this.textDialogContent = document.getElementById("TextDialogContent");
		this.inputField = document.getElementById("InputField");
		this.tableArea = document.getElementById("TableArea");
		this.dataArray = [];
		this.currentRow = 0;
		this.currentColumn = 0;
		this.slate = 0xbbbbbb;
		this.white = 0xffffff;
		this.black = 0x000000;
		this.red = 0xff0000;
		this.green = 0x009900;
		this.blue = 0x0000ff;
		this.highlightColor = 0x333333;
		this.backgroundColorArray = [];
	}
}

const G = new GlobalManager();
G.inputField.focus();

function openEntryDialog() {
	G.textDialog.style.display = "block";
	G.inputField.value = "";
	G.inputField.focus();
}
function cancelEntryDialog() {
	G.textDialog.style.display = "none";
	G.commandArea.innerHTML = "";
}
function okEntryDialog() {
	loadArray();
	G.textDialog.style.display = "none";
	G.commandArea.innerHTML = "";
}

function loadArray() {
	let inputArray = G.inputField.value.split(/\s+/);
	G.dataArray = inputArray.filter((p) => p != "").map((p) => [p]);
	G.currentRow = G.currentColumn = 0;
	G.backgroundColorArray = [];
	for (let i = 0; i < G.dataArray.length; i++) {
		G.backgroundColorArray.push(0);
	}
	createTable();
}

function createTable() {
	G.tableArea.innerHTML = "";
	if (G.dataArray.length == 0)  return;
	let rNo = 0;
	for (const r of G.dataArray) {
		let cNo = 0;
		let newRow = G.tableArea.insertRow();
		for (const c of r) {
			let newCell = newRow.insertCell();
			newCell.innerHTML = c;
			if (c != "") {
				newCell.style = colorStyle(colorString(G.backgroundColorArray[rNo]));
			} else {
				newCell.style = colorStyle(colorString(0));
			}
			let param = "R" + rNo + "C" + cNo;
			newCell.id = param;
			newCell.addEventListener("click", (e) => { clicked(param); });
			cNo++;
		}
		rNo++;
	}
	let i = 0;
	while(G.dataArray[G.currentRow][i] == "") {
		i++;
	}
	G.currentColumn = i;
	colorCell(colorString(G.backgroundColorArray[G.currentRow] + 16),
		G.currentRow, G.currentColumn);
	setButtonColors();
}

function clicked(param) {
	let m = param.match(/^R(\d+)C(\d+)$/);
	G.currentRow = Number(m[1]);
	G.currentColumn = Number(m[2]);
	createTable();
	return;
}

window.addEventListener("keydown", (e) => {
	G.commandArea.style.backgroundColor = "MistyRose";
});

window.addEventListener("keyup", (e) => {
	G.commandArea.style.backgroundColor = "white";
});

window.addEventListener("keydown", (e) => {
	if (G.textDialog.style.display == "block") {
		if (e.key == "Escape") {
			cancelEntryDialog();
		} else if (e.ctrlKey && e.key == "Enter") {
			okEntryDialog();
		}
		
		return;
	}
	if ((e.key == "Enter") && (e.ctrlKey)) {
		openEntryDialog();
		return;
	}
	if (e.ctrlKey || e.metaKey)  return;
	G.commandArea.innerHTML = e.key;
	switch (e.key) {
		case "ArrowUp" :
			arrowUp();
			e.preventDefault();
			break;
		case "ArrowDown" :
			arrowDown();
			e.preventDefault();
			break;
		case "ArrowLeft" :
			arrowLeft();
			e.preventDefault();
			break;
		case "ArrowRight" :
			arrowRight();
			e.preventDefault();
			break;
		case "+" :
			mergeWords();
			e.preventDefault();
			break;
		case "/" :
			explodeWord();
			e.preventDefault();
			break;
		case "r" :
		case "R" :
			toggleRed();
			e.preventDefault();
			break;
		case "g" :
		case "G" :
			toggleGreen();
			e.preventDefault();
			break;
		case "b" :
		case "B" :
			toggleBlue();
			e.preventDefault();
			break;
		default:
	}
});

function arrowUp() {
	G.currentRow = (G.currentRow == 0) ? 0 : G.currentRow - 1;
	createTable();
}

function arrowDown() {
	let upperBoundary = G.dataArray.length - 1;
	if (upperBoundary < 0) return;
	G.currentRow = (G.currentRow < upperBoundary) ? G.currentRow + 1: upperBoundary;
	createTable();
}

function arrowLeft() {
	if (G.currentColumn <= 0) return;
	let index = G.currentColumn - 1;
	for (let r = G.currentRow; r < G.dataArray.length; r++) {
		if (G.dataArray[r][index] != "") break;
		G.dataArray[r].shift();
	}
	G.currentColumn = index;
	createTable();
}

function arrowRight() {
	for (let r = G.currentRow; r < G.dataArray.length; r++) {
		G.dataArray[r].unshift("");
	}
	G.currentColumn++;
	createTable();
}

function mergeWords() {
	if (G.currentRow >= G.dataArray.length - 1) return;
	let line = G.dataArray[G.currentRow];
	G.dataArray[G.currentRow][G.currentColumn] = line[line.length - 1] + " " +
		(G.dataArray[G.currentRow+1].join(""));
	G.dataArray.splice(G.currentRow+1, 1);
	createTable();
}

function explodeWord() {
	if (G.dataArray.length == 0) return;
	let tokenArray = G.dataArray[G.currentRow][G.currentColumn].split(/\s+/);
	let depth = G.dataArray[G.currentRow].length - 1;
	G.dataArray[G.currentRow][G.currentColumn] = tokenArray.shift();
	let counter = 1;
	for (let token of tokenArray) {
		let newLine = [];
		for (let c = 0; c < depth; c++) newLine.push("");
		newLine.push(token);
		G.dataArray.splice(G.currentRow + counter, 0, newLine);
		counter++;
	}
	createTable();
}

function setButtonColors() {
	let colorData = G.backgroundColorArray[G.currentRow];
	if (colorData & 1) {
		G.buttonRed.style = "background:red;color:white;";
	} else {
		G.buttonRed.style = "background:'#d1d1d1';color:black;";
	}
	if (colorData & 2) {
		G.buttonGreen.style = "background:green;color:white;";
	} else {
		G.buttonGreen.style = "background:'#d1d1d1';color:black;";
	}
	if (colorData & 4) {
		G.buttonBlue.style = "background:blue;color:white;";
	} else {
		G.buttonBlue.style = "background:'#d1d1d1';color:black;";
	}
}

function toggleRed() {
	G.backgroundColorArray[G.currentRow] ^= 1;
	createTable();
}

function toggleGreen() {
	G.backgroundColorArray[G.currentRow] ^= 2;
	createTable();
}

function toggleBlue() {
	G.backgroundColorArray[G.currentRow] ^= 4;
	createTable();
}

function colorStyle(backColor) {
	let foreColor = (backColor == "#ffffff") ? "#000000" : "#ffffff";
	return  "color:" + foreColor + "; background-color:" + backColor;
}

function colorCell(backColor, row, col) {
	let elem = document.getElementById("R" + row + "C" + col);
	elem.style = colorStyle(backColor);
}

function colorString(color) {
	let val  = 0;
	let mixed = 0;
	if (color & 1) {
		val += G.red;
		mixed++;
	}
	if (color & 2) {
		val += G.green;
		mixed++;
	}
	if (color & 4) {
		val += G.blue;
		mixed++;
	}
	let newColor;
	if (val == 0) {
		newColor = 0xffffff;
	} else {
		newColor = Math.trunc((val >>> 16) / mixed * 65536) +
			Math.trunc(((val & 0xff00) >>> 8) / mixed * 256) +
			(val & 0xff);
	}
	if (color & 16) {
		newColor = newColor & (~G.highlightColor);
	}
	return "#" + ("000000" + newColor.toString(16)).slice(-6);
}
