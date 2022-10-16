import { GAME_STATUS ,PAIRS_COUNT,GAME_TIME } from './constants.js';
import { getColorElementList,
         getTimerElement,
         getPlayAgainButton,
         getColorBackground,
         getColorListElement, 
         getInActiveColorList} from './selectors.js';
import { createTimer, getRandomColorPairs, hidePlayAgainButton, setBackgroundColor, setTimerText, showPlayAgainButton } from './utils.js';

// Global variables
let selections = []
let gameStatus = GAME_STATUS.PLAYING
let timer = createTimer({
    seconds : GAME_TIME ,
    onChange : handleTimerChange ,
    onFinish : handTimerFinish,
})

function handleTimerChange(seconds){

    const fullSecond = `0${seconds}`.slice(-2) ;
    setTimerText(fullSecond) ;
}
function handTimerFinish(){
    // end Game
    gameStatus = GAME_STATUS.FINISHED ;
    setTimerText('Game Over ') ;
    
}
// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click
function handleColorClick(liElement){
    const shouldBlockClick = [GAME_STATUS.BLOCKING , GAME_STATUS.FINISHED].includes(gameStatus) ;
    const isClicked = liElement.classList.contains('active') ;

    if(!liElement || shouldBlockClick || isClicked) return ;

    // console.log(liElement) ;
    liElement.classList.add('active') ;

    selections.push(liElement) ;
    if(selections.length < 2) return ;
    // check match
    const firstColor = selections[0].dataset.color ;
    const secondColor = selections[1].dataset.color ;

    const isMatch = firstColor === secondColor ;
    if(isMatch) {
        setBackgroundColor(firstColor) ;
        // check win 
        const isWin = getInActiveColorList().length === 0 ;
        if(isWin){
            // show replay
            showPlayAgainButton() ;
            // show you win
            setTimerText('You win !') ;
            timer.clear() ;
            gameStatus = GAME_STATUS.FINISHED ;
        }
        selections = [] ;
        return ;
    }
    //in case of not match

    // remove active class for 2 li element
    gameStatus = GAME_STATUS.BLOCKING ;
    setTimeout(() => {
        selections[0].classList.remove('active') ;
        selections[1].classList.remove('active') ;

         // reset selections
        selections = [] ;
        // race condition
        if(gameStatus !== GAME_STATUS.FINISHED){
            gameStatus = GAME_STATUS.PLAYING ;
        }
    }, 400);
}

function initColors(){
    // random 8 pair
    const colorList = getRandomColorPairs(PAIRS_COUNT) ;

    // bind to li > div.overlay
    const liList = getColorElementList() ; 
    liList.forEach((liElement , index) => {
        liElement.dataset.color = colorList[index] ;

        const overlayElement = liElement.querySelector('.overlay') ;
        if(overlayElement) overlayElement.style.backgroundColor = colorList[index] ;
    });

}
function attachEventForColorList(){
    const ulElement = getColorListElement() ;
    if(!ulElement) return  ; 
    
    ulElement.addEventListener('click' , (event) => {
       if(event.target.tagName !== 'LI') return ;
       //    console.log(event.target) ;
       handleColorClick(event.target) ;
    }) ;
}
function resetGame(){
    // reset global vars
    gameStatus = GAME_STATUS.PLAYING ;
    selections = [] ;
    // reset DOM element
    const colorElementList = getColorElementList() ;
    for (const colorElement of colorElementList) {
        colorElement.classList.remove('active') ;
    }

    hidePlayAgainButton() ;
    setTimerText('') ;
    // re-generate new colors
    initColors() ;
    // reset background
    setBackgroundColor('transparent') ;

    //start a new game
    startTimer() ;
}

function attachEventForPlayAgainButton(){
    const playAgainButton = getPlayAgainButton() ;
    if(!playAgainButton) return ; 

    playAgainButton.addEventListener('click' , resetGame) ;
}

function startTimer(){
    timer.start() ;
}

(() => {
    initColors() ;
    attachEventForColorList() ;
    attachEventForPlayAgainButton() ;
    startTimer() ;
})();