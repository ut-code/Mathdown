import * as math from "mathjs";

/* example syntax / mathjs: 
input:

!define ピタゴラスの定理

$$
c = sqrt(a^2 + b^2)
$$

output:

!define ピタゴラスの定理

$$
c = \sqrt{a^{2} + b^{2}}
$$

*/
type markdown = string;
type AvailableSyntaxes = 
  | "mathjs" // mathjs-powered simplified TeX
  | "math" // literal KaTeX
  | "unspecified"; // default value; (should be) impossible to reach

// WARNING: this function may fail if m contains invalid syntax \ invalid syntax type (not in the AvailableSyntaxes)
export function replaceExternalSyntax(m: markdown): markdown {
  let result = "";
  let blockModeLines = [];
  let syntaxType: AvailableSyntaxes = "unspecified";
  let isBlockMode = false;
  let lines = 0;
  for (const line of m.split("\n")) {
    ++lines;
    if (isBlockMode) {
      blockModeLines.push(line);
    } else if (!line.startsWith("```")){
      result += line + "\n";
    }
    if (line.startsWith("```")) {
      isBlockMode = !isBlockMode;
      if (isBlockMode) {
        // start of block mode;
        const syntaxSpecifier = line.slice(3).trim();
        switch (syntaxSpecifier) {
          case "math":
            syntaxType = "math";
            break;
          case "mathjs":
            syntaxType = "mathjs";
            break;
          case "":
            throw new Error(
              `Please Specify a syntax specifier on line ${lines}`,
            );
          default:
            throw new Error(
              `Unrecognized Syntax Specifier: ${syntaxSpecifier} on line ${lines}`,
            );
        }
      } else {
        // end of block mode;
        if (line.trim() !== "```") {
          throw new Error(`Invalid syntax: expected ${"```"} at line ${lines}`);
        }
        blockModeLines.pop(); // get rid of the last ```
        const block = blockModeLines.join("\n");
        result += handle(block, syntaxType);
        blockModeLines = [];
      }
    } else if (line.includes("{math}") && line.includes("{}")) {
      // TODO: complete this inline functionality
    }
  }
  return result;
}

function handle(block: string, syntaxType: AvailableSyntaxes) {
  switch (syntaxType) {
    case "math":
      return KaTeX(block);
    case "mathjs":
      return MathJS(block);
    default:
      throw new Error(`Unknown Syntax Type: ${syntaxType}`);
  }
}

type mathjs = string;
type tex = string;
function MathJS(m: mathjs): tex {
  return "```math\n" + math.parse(m).toTex() + "\n```\n";
}
function KaTeX(b: block): tex {
  return "```math\n" + b + "\n```\n";
}

function assert(b: bool, text: string = "Explicit assertion failed.") {
  if (!b) {
    throw new Error(text);
  }
}
