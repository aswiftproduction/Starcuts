/**
 * Created by Larry on 5/9/2017.
 */

var numPeople = 0;
var numConsectutivePeap=0;
var numConsecutiveBlank=0;

var maxBlank=6;
var maxPeople=6;
var ranArray = ['blank'];

//types of guys
var norm = ['pinknpc','borednpc','talking_r','tallguy'];
var stop = ['talking_l', 'sleepingguy']
var special = ['tossingguy','pacingguy','phoneguy'];

function ranInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//returns if the enemie placed should be special, gets higher as level continues
function specialRan(numPeap){
    if (Math.random()<0.1 || Math.random()<numPeap/numPeople)
        return true;
    return false;
}

function blankProb(numPeap){
	//blank probability decreases as level continues
	tmp=(1-(numPeap/numPeople))
	//probability for blank is always between 0.4 at worst and 0.7 at best
	tmp=(tmp>0.7)?0.7:tmp;
	tmp=(tmp<0.4)?0.4:tmp;
	return tmp;
    /*if (numPeap < 25)
        return .8
    if (numPeap < 50)
        return .6;
    else if (numPeap < 75)
        return .5;
    else
        return .4;*/
}

function pushPerson(numPeap) {
    var x = Math.random();

    if ((x < blankProb(numPeap) && numConsecutiveBlank<maxBlank+1) || numConsectutivePeap>=maxPeople-1) {
		numConsectutivePeap=0;
		numConsecutiveBlank++;
		//if this if the first 'blank' place a stopGuy and ensure there is at least one blank after him
        if (numConsecutiveBlank===1) {
            ranArray.push(stop[ranInt(0,stop.length-1)]);
			numConsectutivePeap=numPeople+1;
        }else{
            ranArray.push('blank');
        }
    }
    else{
		numConsectutivePeap++;
		numConsecutiveBlank=0;
        if (specialRan(numPeap)) {
            var specialguy = (special[ranInt(0, special.length-1)]);
			//the special guys who need space
			if (specialguy === 'pacingguy'){
                ranArray.push(specialguy);
                ranArray.push('blank');
            }else if(specialguy === 'phoneguy'){
                ranArray.push(specialguy);
                ranArray.push('blank');
            }
			//any other special guys
			else {
                ranArray.push(specialguy);
            }
        }
        else{
            ranArray.push(norm[ranInt(0,norm.length-1)]);
        }
    }
}



function array100(numEnemies) {
    ranArray = [];
    numPeople = numEnemies;
    for(numPeap=0;numPeap < numPeople-2;numPeap++) {
        pushPerson(numPeap);
    }
	ranArray.push('blank');
	ranArray.push('borednpc');
    return ranArray;
}

