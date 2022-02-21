// first bash at a CSV file assignment autograder for adapt

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "a1.csv", // TODO test with over-cleaned version of file
        dataType: "text",
        //accept: ".csv",
        success: function(data) {processData(data);}
     });
});

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];
    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(headers[j]+":"+data[j]);
            }
            lines.push(tarr);
          }
        }
        JSON.stringify(lines);
        // finding the shape of the dataset and getting ready to extract
        let foo = grouped(lines);
        let bar = getKeys(lines); // what are the values in the columns?
        let numRows = bar.length; // how many rows does the csv have?
        let cols = JSON.stringify(foo);
        /* will use these 3 to find columns named something like the output
           we're expecting e.g. facility name, facility type, region,
           facility ownership type */
        let cs = cols.match(/class:\w+/g); // how many classes?
        let ms = cols.match(/mode:\w+/g); // how many modes?
        let ps = cols.match(/player:\w+/g); // how many players?
        let stars = cols.match(/matches:\w+/g); // regex for likely numeric column e.g. 'star' or 'rating'
        const criteria = ['players', 'modes', 'classes', 'rows']; // rename these for Tanzania data
        const expVals = [4, 14, 3, 100];
        const actVals = [ps.length, ms.length, cs.length, numRows];
        var grades = getGrades(criteria, expVals, actVals);
        var starVals = findStars(stars);
        console.log('star vals', starVals);
        var starSum = starVals[0];
        var starGrade = starVals[1];
        let overallMark = grades[3].stats.grade;
        let finalMark = overallMark + starGrade;
        var starFeedback = starVals[2];
        let finalGrade = finalMark/10*100; // TODO define overallGrade and add here

        document.getElementById("grade").textContent=`${finalGrade}%`;
        document.getElementById("result").textContent=`You scored ${finalMark}/10 marks or ${finalGrade}%`;
        document.getElementById("rows").textContent=`  ${numRows} rows, expected ${grades[3].stats.exp}.`;
        document.getElementById("classes").textContent=`  ${cs.length} classes, expected ${grades[0].stats.exp}`;
        document.getElementById("modes").textContent=`  ${ms.length} modes, expected ${grades[1].stats.exp}`;
        document.getElementById("players").textContent=`  ${ps.length} players, expected ${grades[2].stats.exp}`;
        document.getElementById("feedback").textContent=`${grades[3].stats.fb}`;
        document.getElementById("starsGrade").textContent=`Your ratings total is ${starSum}.`;
        document.getElementById("starsFeedback").textContent=`${starFeedback}`;
}

var getKeys = function(lines){
   var keys = [];
   for(var key in lines){
      keys.push(key);
   }
   return keys;
}

function findStars (stars) {
  // fetching numeric values from stringifed object
  console.log(stars);
  // fetch what should be the numeric column, get the values and sum them
  let starSum  = 0;
  let starVals  = [];
  stars.forEach(function(item) {
    try {
      // [TODO] need something that throws exception & complains if there isn't a number
      thenum = item.match(/\d+/)[0] //
      //console.log('thenum', thenum);
      starSum += Number(thenum);
    }
    catch (e) {}
  })
  if (starSum == 163) {
    starGrade = 2;
    starFeedback = 'Correct!';
  } else if (starSum > 163) {
    starGrade = 1;
    starFeedback = "Hmm, we get a different value. Are you sure you're only counting individual ratings?";
  } else if (starSum < 163) {
    starGrade = 1;
    starFeedback = "Hmm, we get a different value. Have you checked that your star ratings column contains numbers?";
  }
  starVals.push(starSum, starGrade, starFeedback);
  console.log('in function vals', starVals);
  return starVals;
}

var getGrades = function grading (criteria, expVals, actVals) {
  // checking number of rows, number of unique entites in the column values
  /* for this to work we might need to be very prescriptive
     about column names and types i.e. 'your file must contain at least
    4 columns with name, type, rating & ownership' */
  var x = [];
  const gradesJson = [];
  var overallGrade = 0;
  for (var i=0;i<criteria.length;i++) {
    //console.log('vals are ', actVals[i], expVals[i]);
    let actVal = actVals[i];
    let expVal = expVals[i];
    let crit = criteria[i];
    if (actVal == expVal) {
      var feedback = 'Correct!';
      //var feedback = '  ';
      overallGrade += 2; // good
      x.push(i, crit, actVal, expVal, overallGrade, feedback);
      gradesJson.push ({
        crit,
        'stats': {
          'act': actVal,
          'exp': expVal,
          'fb': feedback,
          'grade': overallGrade
        }
      });
    } else if (actVal < expVal) {
      var feedback = 'Check your file! looks like you might have removed too many values.';
      overallGrade += 1; // pass
      x.push(i, crit, actVal, expVal, overallGrade, feedback);
      gradesJson.push ({
        crit,
        'stats': {
          'act': actVal,
          'exp': expVal,
          'fb': feedback,
          'grade': overallGrade
        }
      });
    } else if (actVal > expVal) {
      var feedback = 'Check your file! you might still have some duplicate values.';
      overallGrade += 1; // pass
      x.push(i, crit, actVal, expVal, overallGrade, feedback);
      gradesJson.push ({
        crit,
        'stats': {
          'act': actVal,
          'exp': expVal,
          'fb': feedback,
          'grade': overallGrade
        }
      });
    } else {
      x.push(0,0,0,0,0);
    }
  }
  //console.log('x', x)
  console.log('grade', overallGrade);
  console.log('grades dict', gradesJson);
  return gradesJson;
}

function grouped (lines) {
  var r = [];
  var groupFieldName = "class";
  lines.forEach(function (a) {
    var self = this;
    if (!self[a[groupFieldName]]) {
      var tempObj = {
        group: a[groupFieldName]
      };
      self[a[groupFieldName]] = tempObj;
      r.push(self[a[groupFieldName]]);
    }
    var keys = Object.keys(a);
    keys.forEach(function(key){
      if(key != groupFieldName){
        if(self[a[groupFieldName]][a[key]] == undefined){
          self[a[groupFieldName]][a[key]] = 1;
        }else{
          self[a[groupFieldName]][a[key]]++;
        }
      }
    });
  }, Object.create(null));
  return r;
}

/*
once we have an object returned (the summary details for the object that describe its shape and values)
we need to know what constitues a pass, and what does that look like in our summary object?
-------
what do we pull people up on in the tutor grading?
- removing useful data
- not making the star ratings numeric
- not removing total rows and extra header rows
- ignoring reg/cou/year
- not giving us a csv  (multiple sheets, excel workbook etc)
- leaving in duplicates
- whitespace
- meaningful column names
-------
how do we spot these in our summary object?
-  not giving us a csv:
- - grader cannot read the given file - set it specifically expect a text file
- - NB TODO test this with some other filetypes
- - allow .txt and .csv but not .tsv .xlsx .odt
- removing useful data:
- - facility type must have exactly x distinct values (expected number of types)
- - star rating must have exactly 5 distinct values (0, 1, 2, 3, 4)
- - region values must exist - search grouped object for region names we know don't show up in facility names
- meaningful column names:
- - regex search should find 'name', 'type', star', region,  etc in object.keys
- not making the star ratings numeric:
- - sum of star ratings must resolve to a specific numeric value
- not removing total rows and extra header rows:
- - length of summary object must be exactly x (expected number of rows)
- leaving in duplicates:
- - could seed with one or more deliberate duplicates including whitespace
- - if 'xyz' value appears in object.keys or in grouped object we know they missed it
- whitespace:
- - could use regex to strip a sample of values and see what's left
- - NB this might be covered by duplicates check
** GRADING CRITERIA **
LO manage data in a spreadsheet - not sure we can autograde this
  FAIL - no understanding of basic spreadsheet principles
  PASS - some attempt was made to use basic spreadsheet principles to enhance the usability of the data
  GOOD - effective application of spreadsheet principles led to a usable spreadsheet
  EXCELLENT - a deep understanding of spreadsheet principles was applied throughout
LO clean, validate and perform quality checks on data
  FAIL - data remains of inadequate quality to use - can't extract columns to check
  PASS - data quality has increased however there are still many errors - too much removed or duplicates remain
  GOOD - all data quality errors have been fixed - correct number of unique attributes
  EXCELLENT - a deep understanding of data quality has been demonstrated throughout -
LO restructure and organise data
  FAIL - the data is in an unusable structure
  PASS - some attempt was made to effectively restructure the data but the data remains difficult to use - star rating is not numeric
  GOOD - data has been restructured into a usable format
  EXCELLENT - a deep understanding of data structures has been demonstrated throughout
LO design a schema for the data - difficult to autograde
  FAIL - no evidence of a common schema
  PASS  - there is some evidence of a careful schema design for the data
  GOOD - the dataset has a clear and consistent schema
  EXCELLENT - a deep understanding of schemas has been applied throughout


*/
