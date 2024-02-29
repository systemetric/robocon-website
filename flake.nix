{
  description = "A basic flake with a shell";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.05";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        overlays = if system == "aarch64-darwin"
                   then [
                     (final: prev: {
                       curl = prev.curl.overrideAttrs (prevAttrs: {doCheck = false;});
                       bison = prev.bison.overrideAttrs (prevAttrs: {doCheck = false;});
                     })
                   ]
                   else [];
      };

      node =
        pkgs.nodejs-12_x.overrideAttrs
        (prevAttrs: {meta.knownVulnerabilities = [];});
    in {
      devShells.default = pkgs.mkShell {
        nativeBuildInputs = with pkgs; [
          node
          (yarn.override {nodejs = node;})
          python2
          go
          netlify-cli
        ];
        buildInputs = [];
      };
    });
}
