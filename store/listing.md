# Google Play listing

Text and answers for the Play Console. Graphics are in this folder:
`icon-512.png`, `feature-graphic.png` and `screenshots/` (1080 × 1920).

## App details

- **App name** (30 max): Milvaflow: Send Mobile Money
- **Short description** (80 max): Send mobile money in seconds: type the amount, pick who, enter your PIN.
- **Category:** Finance
- **Tags:** payments, money transfer
- **Contact email:** the MilvaLabs support address (shown publicly)
- **Privacy policy URL:** where `privacy-policy.md` is published on the
  MilvaLabs website

## Full description (4000 max)

Pay anyone with Mobile Money without going through the *182# menus.

Type the amount, choose who to pay, and Milvaflow dials the full code for
you. MTN's own screen then asks for your PIN, and that's it.

Pay to:
• MTN and Airtel numbers
• MoMo Pay merchant codes
• Bank accounts through eKash

Fast
• A big number pad for the amount
• Search your contacts by name or number
• Recent payments at the top, so paying someone again takes one tap

Private by design
• No internet access: Milvaflow cannot send your data anywhere
• No account, no ads, no tracking
• Your contacts stay on your phone
• Milvaflow never sees your PIN; you type it on MTN's screen

Requirements
• An Android phone with an MTN Rwanda SIM and Mobile Money
• Standard MTN Mobile Money fees apply

Milvaflow is made by MilvaLabs and is not affiliated with, endorsed by or
sponsored by MTN Rwanda. MTN and MoMo are trademarks of their owners.

## App content answers

- **Ads:** No ads.
- **App access:** All features are available without signing in.
- **Target audience:** 18 and over.
- **Content rating:** Utility app. No violence, sexual content, gambling,
  user-generated content or sharing of location.
- **Government app:** No.
- **Financial features:** Milvaflow does not hold money, process payments,
  lend or offer accounts. It dials the MTN Mobile Money USSD code for a
  payment the user enters, and MTN processes it after the user enters their
  PIN on MTN's screen. Choose the category that fits closest in the current
  form and use this description wherever it asks for one.
- **Health, news, COVID-19:** Not applicable.

## Data safety answers

- **Does the app collect or share user data?** No. "Collected" means sent
  off the device; Milvaflow has no internet access.
- **Contacts:** read on the device only to search them, never stored or sent.
- **Recent payments:** stored on the device only.
- **Encrypted in transit:** Not applicable (nothing is transmitted).
- **Can users request deletion?** Data never leaves the phone; users remove
  recent payments in the app or by uninstalling.

## Permissions

- `CALL_PHONE`: dials the USSD code for the payment the user chose.
- `READ_CONTACTS`: search contacts when choosing who to pay. The app explains
  this before Android's permission prompt.

## Releasing

1. `npx eas-cli@latest login` with the MilvaLabs Expo account, then
   `npx eas-cli@latest init` once to link the project.
2. `npx eas-cli@latest build -p android --profile production` builds a signed
   App Bundle. EAS creates and keeps the upload key; the build number goes up
   on every build.
3. The first upload to Play is manual: create the app in the Play Console and
   upload the `.aab` to the internal testing track.
4. After that, `npx eas-cli@latest submit -p android --profile production`
   uploads new builds to internal testing as drafts (needs a Google service
   account key, set up once in the Play Console).
