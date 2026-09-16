// The dots spinner, nothing else: `node source/spinner.js`.

const dots = [".  ", ".. ", "...", " ..", "  ."];
let frame = 0;

const id = setInterval(() => {
    process.stdout.write(`\r${dots[frame]}`);
    frame = (frame + 1) % dots.length;
}, 80);

await new Promise((resolve) => setTimeout(resolve, 2000));

clearInterval(id);
process.stdout.write("\r\x1b[2K");
console.log("done");
