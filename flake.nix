{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        name = "Mathdown";
      in
      {
        devShell = pkgs.mkShell {
          inherit name;
          buildInputs = with pkgs; [
            nodejs_22
          ];
          shellHook = '''';
        };
      });
}
