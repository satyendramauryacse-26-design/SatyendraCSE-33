const fs = require("fs"); // import file system
// fs.writeFile("student.txt", "This is a student file of CSE 33", (err) => {
//   if (err) {
//     console.log("err");
//   } else {
//     console.log("file successfully created");
//   }
// });
//
fsl.readFile("student.txt",Utf8Stream,(err,data)=>{
    if(err)throw err
    else{
        console.log("read a file content");
        console.log("data");

    }
});