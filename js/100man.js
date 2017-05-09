/**
 * Created by Larry on 5/9/2017.
 */

var numPeople = 0;

var ranArray = ['blank'];

var norm = ['pinknpc','borednpc','talking_r'];

var special = ['tossingguy','pacingguy','phoneguy'];

function ranInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function specialRan(numPeap){
    if (Math.random() < numPeap/100)
        return true;
    return false;
}

function blankProb(numPeap){
    if (numPeople < 25)
        return .8
    if (numPeople < 50)
        return .6;
    else if (numPeople < 75)
        return .5;
    else
        return .4;
}

function pushPerson(numPeap) {
    var x = Math.random();

    if (x < blankProb(numPeap)) {
        if (ranArray[ranArray.length - 1] === 'blank') {
            ranArray.push('blank');
        }else{
            ranArray.push('talking_l');
            numPeople++;
            ranArray.push('blank');
        }
    }
    else{
        if (specialRan(numPeap)) {
            var specialguy = (special[ranInt(0, 2)]);
            if (numPeople === 99) {
                ranArray.push('boredguy');
                numPeople++;
            }else if (specialguy === 'pacingguy'){
                ranArray.push(specialguy);
                ranArray.push('blank');
                numPeople++;
            }else if(specialguy === 'phoneguy'){
                ranArray.push(specialguy);
                ranArray.push('blank');
                numPeople++;
            }else {
                ranArray.push(specialguy);
                numPeople++;
            }
        }
        else{
            ranArray.push(norm[ranInt(0,2)]);
            numPeople++;
        }
    }
}



function array100() {
    ranArray = [];
    numPeople = 0;
    while (numPeople < 100) {
        pushPerson(numPeople);
    }
    return ranArray;
}

