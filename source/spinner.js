
// let message = "Hello world! How are you doing?"



// await new Promise((resolve) => setTimeout(resolve, 2000));

// message = "I am doing great!"

// await new Promise((resolve) => setTimeout(resolve, 2000));

// clearInterval(id);
// process.stdout.write("\r\x1b[2K");
// console.log("done");


const groups = [
  {messages:["Hello", "Hi"] },
  {messages:["Who are you?", "Hursh"] }
]


const dots = [".  ", ".. ", "...", " ..", "  ."];
let frame = 0;

// const id = setInterval(() => {
//   for (const { messages } of groups) {
//     const [message]  = messages
//     process.stdout.write(`\r\x1b[2K${dots[frame]}\t${message}\r\x1b[A`);
//   }

//   process.stdout.write()

//   frame = (frame + 1) % dots.length;
// }, 80);

const up= (rows = 1) => `\x1b[${rows}A`
const down = (rows = 1) => `\x1b[${rows}B`
const start = "\r"
const clear = "\x1b[2K"
const newline = "\n"

// process.stdout.write(`\r\x1b[2KHello\nHowdy`);
process.stdout.write(`${start}${clear}Hello${newline}${down()}Howdy`)
process.stdout.write(`${start}${clear}Hursh\n`);
