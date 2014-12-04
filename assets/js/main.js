/**
 * Created by Harris Sidiropoulos
 */

(function() {
    "use strict";

    var puzzle,
        puzzleContainer,
        photoParts,
        levelRadioGroup,
        helpInput,
        photoPartsBackgroundPositions,
        totalPhotoParts,
        emptyPhotoPartIndex,
        columns,
        solutionArray,
        solveInterval,
        displayNumbers = true,
        Keyboard = {
            ENTER: 13,
            SPACE: 32,
            PREVIOUS: 37,
            UP: 38,
            NEXT: 39,
            DOWN: 40
        };

    function findNeighborPhotoParts(index) {
        index = typeof index!=="undefined"?index:emptyPhotoPartIndex;
        var array = [];
        if (index-columns>=0) {
            array.push(index-columns);
        }
        if (index+columns<totalPhotoParts) {
            array.push(index+columns);
        }
        if (index-1>=0 && index%columns!==0) {
            array.push(index-1);
        }
        if (index+1<totalPhotoParts && (index+1)%columns!==0) {
            array.push(index+1);
        }
        return array;
    }
    function isNeighborPhotoPart(index) {
        return findNeighborPhotoParts().indexOf(index)>=0;
    }
    function shufflePhotoParts(array) {
        solutionArray = [];
        var i, neighborPhotoParts, randomPhotoPartIndex, repeat = totalPhotoParts*50;
        for (i=0;i<repeat;i++) {
            neighborPhotoParts = findNeighborPhotoParts();
            randomPhotoPartIndex = neighborPhotoParts[Math.floor(Math.random()*neighborPhotoParts.length)];
            array[emptyPhotoPartIndex] = array[randomPhotoPartIndex];
            array[randomPhotoPartIndex] = null;
            emptyPhotoPartIndex = randomPhotoPartIndex;
            solutionArray.push(randomPhotoPartIndex);
        }
        return array;
    }
    function onPuzzleKeyUp(event) {
        var eventTarget = event.target,
            index = eventTarget.tabIndex- 1;
        if (event.keyCode===Keyboard.SPACE || event.keyCode===Keyboard.ENTER) {
            onPuzzlePhotoPartClick(event);
        } else if (event.keyCode===Keyboard.PREVIOUS) {
            if (index-1>=0) {
                photoParts[index-1].focus();
            }
        } else if (event.keyCode===Keyboard.UP) {
            if (index-columns>=0) {
                photoParts[index-columns].focus();
            }
        } else if (event.keyCode===Keyboard.NEXT) {
            if (index+1<totalPhotoParts) {
                photoParts[index+1].focus();
            }
        } else if (event.keyCode===Keyboard.DOWN) {
            if (index+columns<totalPhotoParts) {
                photoParts[index+columns].focus();
            }
        }
    }
    function onPuzzleMouseDown(event) {
        if (event.shiftKey) {
            puzzleContainer.style.opacity = 0;
        }
    }
    function onPuzzleMouseUp(event) {
        puzzleContainer.style.opacity = 1;
    }
    function onPuzzlePhotoPartClick(event) {
        var eventTarget = event.target,
            index = eventTarget.tabIndex-1;

        if (event.ctrlKey && event.altKey) {
            solvePuzzle();
            return;
        }
        if (event.shiftKey) return;
        solutionArray.push(emptyPhotoPartIndex);
        movePhotoPart(eventTarget);
    }
    function movePhotoPart(eventTarget) {
        var index = eventTarget.tabIndex-1;
        if (isNeighborPhotoPart(index)) {
            photoParts[emptyPhotoPartIndex].className = "photo";
            photoParts[emptyPhotoPartIndex].style.backgroundPosition = eventTarget.style.backgroundPosition;
            photoParts[emptyPhotoPartIndex].setAttribute("data-index", eventTarget.getAttribute("data-index"));
            if (displayNumbers) photoParts[emptyPhotoPartIndex].innerHTML = "<span>"+(parseInt(eventTarget.getAttribute("data-index"))+1)+"<span>";
            photoParts[emptyPhotoPartIndex].focus();
            eventTarget.className = "";
            eventTarget.removeAttribute("data-index");
            emptyPhotoPartIndex = index;
            if (displayNumbers) photoParts[emptyPhotoPartIndex].innerHTML = "";
            if (isPuzzleCompleted()) {
                puzzleContainer.style.display = "none";
            }
        }
    }
    function isPuzzleCompleted() {
        var i, item;
        for (i = 0; i < photoParts.length-1; i += 1) {
            item = photoParts[i];
            if (parseInt(item.getAttribute("data-index"))!==i) {
                return false
            }
        }
        return true;
    }
    function shufflePuzzle() {
        photoPartsBackgroundPositions = shufflePhotoParts(photoPartsBackgroundPositions);
    }
    function drawPuzzle() {
        var i, item
        puzzleContainer.innerHTML = "";
        for (i = 0; i < totalPhotoParts; i += 1) {
            puzzleContainer.innerHTML += "<li></li>";
        }
        photoParts = document.querySelectorAll("#photoPuzzle li");
        for (i = 0; i < photoParts.length; i += 1) {
            item = photoParts[i];
            if (photoPartsBackgroundPositions[i]!==null) {
                item.className = "photo";
                item.style.backgroundPosition = photoPartsBackgroundPositions[i].backgroundPosition;
                item.setAttribute("data-index", photoPartsBackgroundPositions[i].index);
                if (displayNumbers) item.innerHTML = "<span>"+(photoPartsBackgroundPositions[i].index+1)+"</span>";
            } else {
                item.removeAttribute("data-index");
            }
            item.tabIndex = i+1;
        }
    }
    function calculatePuzzle() {
        var i, initImgX, imgX, imgY, cellWidth, cellHeight, puzzlePhotoPartTemplate;

        puzzlePhotoPartTemplate = document.querySelector("#photoPuzzle li");

        initImgX = imgX = (puzzlePhotoPartTemplate.offsetWidth-puzzlePhotoPartTemplate.clientWidth)/2;
        imgY = (puzzlePhotoPartTemplate.offsetHeight-puzzlePhotoPartTemplate.clientHeight)/2;

        cellWidth = puzzlePhotoPartTemplate.offsetWidth;
        cellHeight = puzzlePhotoPartTemplate.offsetHeight;

        totalPhotoParts = Math.floor(puzzle.offsetWidth/cellWidth*puzzle.offsetHeight/cellHeight);
        emptyPhotoPartIndex = totalPhotoParts-1;
        columns = Math.floor(puzzle.offsetWidth/cellWidth);

        photoPartsBackgroundPositions = [];
        for (i = 0; i < totalPhotoParts-1; i += 1) {
            imgX = (i%columns===0)          ? initImgX           : imgX+cellWidth;
            imgY = (i%columns===0 && i>0)   ? imgY+cellHeight    : imgY;
            photoPartsBackgroundPositions[i] = {backgroundPosition: -imgX + "px " + -imgY+"px", index: i};
        }
        photoPartsBackgroundPositions.push(null);
    }
    function init() {
        toggleHelp();
        puzzleContainer.style.display = "block";
        calculatePuzzle();
        shufflePuzzle();
        drawPuzzle();
    }
    function solvePuzzle() {
        removeListeners();
        solveInterval = setInterval(function() {
            if (solutionArray.length>0) {
                movePhotoPart(photoParts[solutionArray.pop()]);
            } else {
                if (!isPuzzleCompleted()) {
                    movePhotoPart(photoParts[totalPhotoParts-1]);
                }
                stopSolvingPuzzle();
            }
        }, 100);
        puzzle.addEventListener("click", stopSolvingPuzzle);
    }
    function stopSolvingPuzzle() {
        clearInterval(solveInterval);
        solveInterval = undefined;
        puzzle.removeEventListener("click", stopSolvingPuzzle);
        addListeners();
    }
    function changeLevel(event) {
        if (typeof solveInterval!=="undefined") return;
        if (event.target===event.currentTarget ||
            typeof event.target.value == "undefined" ||
            puzzleContainer.className==event.target.value) return;

        puzzleContainer.className = event.target.value;
        init();
    }
    function toggleHelp() {
        if (!helpInput.checked) {
            puzzle.className += " hideNumbers";
        } else {
            puzzle.className = puzzle.className.split(" hideNumbers").join("");
        }
    }
    function addListeners() {
        puzzle.addEventListener("keyup", onPuzzleKeyUp);
        puzzle.addEventListener("click", onPuzzlePhotoPartClick);
        puzzle.addEventListener("mousedown", onPuzzleMouseDown);
        puzzle.addEventListener("mouseup", onPuzzleMouseUp);
        levelRadioGroup.addEventListener("click", changeLevel);
        helpInput.addEventListener("click", toggleHelp);
    }
    function removeListeners() {
        puzzle.removeEventListener("keyup", onPuzzleKeyUp);
        puzzle.removeEventListener("click", onPuzzlePhotoPartClick);
        puzzle.removeEventListener("mousedown", onPuzzleMouseDown);
        puzzle.removeEventListener("mouseup", onPuzzleMouseUp);
        levelRadioGroup.removeEventListener("click", changeLevel);
        helpInput.removeEventListener("click", toggleHelp);
    }
    window.addEventListener("load", function() {
        puzzle = document.querySelector("#photoPuzzle");
        puzzleContainer = document.querySelector("#photoPuzzle ul");
        levelRadioGroup = document.querySelector("#level");
        helpInput = document.querySelector("#help input");
        addListeners();
        document.querySelector("#level label:nth-child(1)").click();
    });

})();