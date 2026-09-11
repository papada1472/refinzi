# Submitting Refinzi to Microsoft Windows Package Manager (winget)

This directory contains the manifest for publishing Refinzi to the official [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs) repository.

Once submitted, Windows users worldwide can install Refinzi simply by typing:

```powershell
winget install refinzi
```

---

## Submission Steps

### Option A: Using `wingetcreate` (Automated CLI)

1. Install `wingetcreate` from Microsoft:
   ```powershell
   winget install Microsoft.WingetCreate
   ```

2. Submit the new package:
   ```powershell
   wingetcreate new https://github.com/papada1472/refinzi/releases/download/v2.0.0/Refinzi-Setup-v2.0.0.exe
   ```

3. Follow the CLI prompts. `wingetcreate` will automatically download the binary, compute the SHA256 checksum, and file a Pull Request against `microsoft/winget-pkgs` using your GitHub token.

---

### Option B: Manual Pull Request to `microsoft/winget-pkgs`

1. Fork `https://github.com/microsoft/winget-pkgs`.
2. Create the directory path:
   `manifests/p/papada1472/refinzi/2.0.0/`
3. Copy `papada1472.refinzi.yaml` into that directory.
4. Submit a Pull Request. Microsoft's automated CI will validate the installer, run a sandbox test, and merge within 24–48 hours.
