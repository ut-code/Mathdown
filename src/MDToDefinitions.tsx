// FROM: raw user input
// EXPECT: zero or more definitions described, with "`prefix` DEFWORD0 DEFWORD2..." at the start and "`suffix`" at the end
// RETURN: a map of DEFWORD: string -> DEFINITION: string
// EDGE CASE:
// - if `prefix` appears again before `suffix`, finish the last definition and register the new one.
// - if there are no `prefix` appearing in the input, returns empty map.
// - if `suffix` appears before `prefix`, does nothing.
// - if `suffix` doesn't appear before end of userInput, behave like there is `suffix` inserted at the end of input.
export function ExtractDefinitions(
  userInput: string,
  prefix: string = "!define",
  suffix: string = "!enddef",
): Map<string, string> {
  const definitions = new Map<string, string>();
  // supports multi-key definition
  let defKeys: string[] = [];
  let currentDef: string[] = [];
  let mode: "def" | "text" = "text";
  for (const line of userInput.split("\n")) {
    if (mode == "def") {
      currentDef.push(line);
    }
    if (line.startsWith(prefix) && mode == "def") {
      // end definition
      currentDef.pop(); // pop !define ...
      const defValue = currentDef.join("\n");
      for (const key of defKeys) {
        definitions.set(key, defValue);
      }
      currentDef = [];
      // start definition again on the next if stmt.
      mode = "text";
    }
    if (line.startsWith(prefix) && mode == "text") {
      // enter definition mode
      mode = "def";
      defKeys = line.split(" ").slice(1); //  remove !define from the keys
    }
    if (line.startsWith(suffix) && mode === "def") {
      // end definition
      currentDef.pop(); // pop !enddef
      const defValue = currentDef.join("\n");
      for (const key of defKeys) {
        definitions.set(key, defValue);
      }
      currentDef = [];
    }
  }

  if (mode == "def") {
    // user forgot to end definition
    const defValue = currentDef.join("\n");
    for (const key of defKeys) {
      definitions.set(key, defValue);
    }
  }

  return definitions;
}
