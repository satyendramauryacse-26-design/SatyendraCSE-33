const fs1 = require("fs"); // import file System module
// fs1.writeFile("student.txt", "This is a student file of CSE 33", (err) => {
//   if (err)
//   {
//     console.log("err");
//   }
//   else{
//     console.log("file successfully created");
//   }
// });

// Reading a content of a file
fs1.readFile("student.txt", "utf8", (err, data) => {
  if (err) throw err
  else{
    console.log("read a file content");
    console.log(data);
  }
});
fs1.appendFile("student.txt","\nName: Shakib",(err)=>{
    if(err) throw err; 
    else{
        console.log("File successfully appended");
    }
});