# Milvaflow

Send MTN MoMo payments without going through the `*182#` menus. Type the
amount, choose who to pay, and enter your PIN on MTN's prompt.

Supports sending from an MTN SIM to:

| Recipient | Dialed code |
|---|---|
| MTN number | `*182*1*1*<number>*<amount>#` |
| Airtel number | `*182*1*1*<number>*<amount>#` |
| MoMo Pay code | `*182*8*1*<code>*<amount>#` |
| Bank account (eKash) | `*182*1*2*<account>*<amount>#` |

Everything stays on the phone: no account, no server, no tracking, and
release builds have no internet access. The app
keeps a short list of recent recipients so a failed payment can be retried
in one tap.

## Running locally

Requirements: Node 22+, pnpm, Android Studio (SDK + an emulator, or a phone
with USB debugging).

```bash
pnpm install
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
pnpm android
```

Dialing a real USSD code needs a phone with an MTN SIM; an emulator shows
the call screen but has no network to answer it.

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Releasing

Play Store text, privacy policy, graphics and release steps are in
[`store/`](store/listing.md). Builds are made with EAS (`eas.json`).
