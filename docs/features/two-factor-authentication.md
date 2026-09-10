---
sidebar_position: 6
---

# Two-Factor Authentication

Two-factor authentication asks for a second proof of identity when you sign in to the back office: your password, then a temporary code from an authenticator app on your phone (Google Authenticator, Authy, 1Password, and others).

Even if someone steals or guesses your password, they cannot get in without your phone.

This feature is **free**. Each employee turns it on for their own account, and can turn it off again. You can also **require it** for the employees of a given profile, from the **Policy** tab — see [Requiring it for a profile](#requiring-it-for-a-profile).

## Turning it on

Go to **Sentinel > Two-Factor Authentication > My methods** and start the wizard.

1. **Scan the QR code.** Open your authenticator app, choose to add an account, and point your camera at the QR code on screen. If you would rather type things in by hand, the same key is also shown as a line of text you can copy.
2. **Confirm.** Your app now shows a six-digit number that changes every thirty seconds. Type the current one into the wizard. This last step proves your app and the store agree before anything is switched on.

That's it. Your account is protected from the next sign-in onwards.

:::info Your secret stays in your store
The QR code is drawn by your own browser, and nothing is sent to any outside service while you set this up. Your store keeps the secret in encrypted form and never shows it again afterwards.
:::

## Recovery codes: your way back in without your phone

As soon as your app is confirmed, Sentinel generates **ten recovery codes** and shows them once, on the screen right after confirmation. Each one lets you sign in a single time, without your authenticator app.

- **Download them.** A "Download as .txt" button saves the ten codes to a file you can print or store somewhere safe. Keep them anywhere you would keep a spare key — not in an inbox your work account can read.
- **Confirm you've kept them.** You cannot leave this screen until you tick "I have saved these codes". Once you do, this is the last time you will ever see them — Sentinel stores them in a form it cannot read back, the same way it never stores your password in plain text.

### Using a recovery code

If you lose your phone, the sign-in screen that asks for your six-digit code also offers "Use a recovery code". Enter one of your ten codes instead, and you get in exactly as you would with a code from your app.

Each code works **once** — the one you just used stops working immediately, while the other nine stay valid. As with regular codes, six wrong recovery codes in a row block the address trying to sign in.

### Keeping track of how many you have left

**My methods** always shows how many recovery codes you have left, without ever showing the codes themselves — there is no screen, anywhere, that displays a code a second time. When you're down to fewer than three, a warning appears with an offer to generate a fresh set.

### Regenerating a set

Regenerating asks for a fresh code from your authenticator app first — the same proof you'd give to sign in. Once you provide it, ten new codes are shown once, exactly like at enrollment, and every code from the old set — used or not — stops working immediately. There is never more than one valid set at a time.

## Signing in afterwards

Once your account is protected, signing in has one extra step: after your password, Sentinel asks for the six-digit code from your app. Nothing else in the back office opens until you enter a valid one.

After that, you are not asked again for a while. When that period ends, the next sign-in asks for a fresh code.

A few rules keep the code safe to use:

- A code works **once**. Even within the thirty seconds it stays on your screen, it cannot be used a second time.
- A small difference between your phone's clock and the store's clock is tolerated, so you don't get locked out over a few seconds.
- After six wrong codes in a row, the address trying to sign in is blocked, and the attempt is recorded.

## Passkeys: Touch ID, Windows Hello, your phone

Alongside your authenticator app, you can register a **passkey** — the fingerprint, the face or the PIN your computer or phone already uses to unlock itself. Touch ID on a Mac, Windows Hello on a PC, the screen lock on an Android or an iPhone.

Like the rest of two-factor authentication, passkeys are **free**.

A passkey **satisfies a profile requirement on its own**: if your profile is set to *Required*, having a passkey enrolled is enough — you do not also need an authenticator app.

:::warning Passkeys need a secure connection
Browsers only offer passkeys over HTTPS. If your back office is served over plain HTTP, "Add a passkey" does not appear at all, and the enrollment page explains why instead of leaving you looking for it. The [prerequisites check](./prerequisites-check.md) also flags a missing secure origin, so an administrator sees it without having to reach the enrollment page first.
:::

### Adding one

From **Sentinel > Two-Factor Authentication > My methods** — or from the enrollment page at `sentinel/account/two-factor`, which any signed-in employee can reach:

1. **Prove the second factor you already have.** Before registering anything new, Sentinel asks for a fresh code from your authenticator app, or one of your recovery codes. It is the same proof you would give to sign in - and a recovery code given here is spent like any other, one of your ten rather than an extra - and it is what stops somebody who found your session unattended from quietly adding a key of their own. If you have no confirmed method at all yet, nothing is asked: your very first method is registered without it.
2. **Choose "Add a passkey"**, and give it a name you will recognise later — "MacBook Touch ID", "Work PC". The name is for you alone; it is what the list will show.
3. **Confirm on your device.** Your browser opens its own dialog, and your machine asks for your fingerprint, your face or your PIN. Only a public key ever reaches your store: the fingerprint itself never leaves your device, and neither does anything that could reconstruct it.
4. **Check the list.** The passkey now appears in **My methods** with its label and its date. Your authenticator app and your recovery codes are untouched, and still work exactly as before — adding a method never takes one away.

If the browser dialog never appears, the page says so rather than leaving you waiting. The usual causes: the back office is not served over HTTPS (browsers refuse passkeys otherwise), the browser is too old, or the device has no fingerprint reader, no face camera and no PIN set up.

### Signing in with a passkey

Once you have registered one, the sign-in screen offers it above the six-digit code field: confirm with your fingerprint, your face or your PIN, and you are in — no code to read or type. Your authenticator app is not replaced; both stay enrolled, and you choose either one at each sign-in.

Recovery codes work with a passkey exactly as they do with an authenticator app: if you also have none of those ten codes left, **My methods** offers to generate a fresh set once you have confirmed your passkey.

### One device, one entry

A passkey already registered on your account cannot be registered a second time: your device recognises it and says so, instead of offering to create a duplicate. And a passkey already known to the shop — including one registered on **another employee's** account — is refused, with a message that says why.

### Removing one

From **My methods**, remove the passkey and confirm. As with adding, a fresh proof of your second factor is asked first - a code from your authenticator app, or one of your recovery codes when the app is the thing you no longer have.

Removing one never leaves you locked out: if the passkey were your last confirmed method and your profile requires two-factor authentication, the removal is refused and you are sent to enroll something else first.

### The address your back office is served at matters

A passkey is tied to the domain where your back office answers. Move your shop to another domain and the passkeys registered under the old one stop being offered — each employee registers a new one. Two advanced settings let an administrator state that domain, and the addresses accepted alongside it, by hand: useful when the shop sits behind a proxy that hides them. Left empty, they are derived from your shop's own URLs, and a shop that has never touched them registers passkeys just fine.

If your shop sits behind a reverse proxy that terminates HTTPS — the proxy talks HTTPS to the outside world and plain HTTP to your store — you **must** state that domain by hand in those two settings. Without it, Sentinel cannot tell what address your employees actually see in their browser, and rather than guess, it does not offer passkeys at all.

:::warning One passkey, one domain
If your shop answers on several domains — several shops in one multistore install, or the same shop reachable under more than one address — a passkey registered under one domain is not offered under another: each domain needs its own. A warning says so on the enrollment page. If your employees move between domains, the authenticator app stays the one method that works everywhere.
:::

### What Sentinel records about passkeys

Every passkey registered, refused or removed is written to the [Security Logs](./security-logs.md), with the address the request came from. The credential's identifier is never written there in clear.

## Requiring it for a profile

As long as nothing is required, protection depends on each employee's goodwill. The **Policy** tab of **Sentinel > Two-Factor Authentication** lets you require two-factor authentication for the employees of a profile, and give them a window to set it up before it becomes mandatory. Like the rest of the feature, this is free.

### The profile matrix

One switch, **Enforce two-factor authentication on this shop**, arms the whole thing. Under it, each employee profile gets a requirement:

| Requirement | What the employees of the profile get |
| --- | --- |
| **Not required** | Nothing at all: no banner, no enrollment screen, ever — even after everyone else's deadline. |
| **Optional** | Nothing is asked of them. They can still enroll on their own. |
| **Required** | They are warned, then reminded, then required to enroll. |

A column shows how many employees each profile currently holds, so you know what you are about to require of whom. When you save, a confirmation dialog states the number of employees concerned and the earliest date the requirement can bite.

Four settings sit under the matrix:

- **Reminder after (days)** — how long before the reminder screen appears. Default: 7 days.
- **Deadline after (days)** — how long before enrollment becomes mandatory. Default: 30 days. **0** requires it from the very first sign-in; **-1** never requires it, and only ever shows the banner.
- **2FA session lifetime (seconds)** — how long a verified second factor stays valid before a fresh code is asked. 0 keeps it for the back-office session only.
- **Maximum attempts** — how many tries a code gets before the challenge is refused.

Changing a duration afterwards reaches the employees already counted, in the tightening direction only: a deadline brought closer applies to them from their next page on, and a deadline pushed further away never gives anybody extra days.

### Each employee has their own countdown

The countdown does not start when you save the policy. It starts **per employee**, on their first back-office request once the requirement concerns them.

That has three consequences worth knowing:

- An employee created after you saved the policy gets their own full window, starting at their first sign-in — they do not land straight into "mandatory".
- An employee who never signs in never starts a countdown, and is never locked out in their absence.
- The date shown under the matrix is therefore the **earliest** date anyone could reach, not a date true for everybody.

### What the employee sees

1. **Grace.** They sign in normally and see a blue banner: how many days are left, and a link straight to the enrollment page. The banner can be dismissed.
2. **Reminder**, once "Reminder after" has passed. At sign-in, an enrollment screen appears with a countdown and a **Later** button. **Later** lets them straight into the back office and does not come back for 24 hours. From this point the banner turns orange and can no longer be dismissed — the last warning before the door closes is not one you wave away.
3. **Deadline passed.** The same screen, without **Later**. They set up their app right there, in the same wizard as a voluntary enrollment, and carry on into the back office **in the same session** — no second sign-in, nobody to call. Enrollment counts as verification: no code is asked a second time straight after. The ten [recovery codes](#recovery-codes-your-way-back-in-without-your-phone) are handed over exactly as usual, with the same "I have saved these codes" to tick.

The banner never appears on the sign-in page itself.

:::warning The grace period warns; it does not protect
During grace and reminder, a concerned employee still signs in **with their password alone**. The countdown tells them the requirement is coming; it does not protect their account in the meantime. A grace period is notice, not protection.

If you need protection to apply now rather than in a month, set **Deadline after (days)** to `0`: enrollment is then required from the first sign-in concerned.
:::

### Enrolling without access to Sentinel

The employee you require this of may have no read access to the Sentinel menu at all. So the enrollment page is served at its own address, `sentinel/account/two-factor`, to **any signed-in employee** — no Sentinel permission needed. A link on their own employee account page takes them there, so they can also enroll on their own initiative, before anything is required of them.

That page only ever shows the methods of the employee who is signed in. It never takes an employee identifier from the URL, so it cannot be pointed at somebody else's account.

### If nothing can be enrolled here

If the shop is in a state where no method can be enrolled at all, the requirement suspends itself rather than lock anyone out: nobody is asked, nobody is blocked, and a warning is recorded in the [Security Logs](./security-logs.md) once a day until the situation is fixed. The policy you saved is left untouched, so there is nothing to restore afterwards.

### What is recorded

The [Security Logs](./security-logs.md) keep the requirement's milestones: obligation started for an employee, moved to reminder, deadline passed, and exemption granted.

### Exempting one employee

An employee on the road, a phone being replaced, a deadline falling at the worst moment: `sentinel:2fa:exempt` (see [below](#for-administrators-getting-back-in)) gives one employee a set number of days without the requirement. It is temporary — once the days are up, the requirement applies to them again — and it changes nothing in the Policy tab, which keeps applying to everybody else.

## Turning it off

From **My methods**, remove your authenticator app and confirm. Your password alone is enough at the next sign-in.

If your profile is set to **Required**, removing your app does not exempt you: the requirement applies again, and the enrollment screen comes back — straight away if your deadline has already passed.

## Keeping track

Sentinel records each time an account is protected, each successful and failed code entry, each removal, and each use or regeneration of recovery codes in the [Security Logs](./security-logs.md), along with the address it came from and, for recovery codes, how many were left afterwards.

## If something goes wrong

Sentinel is built so that a problem with the second-factor check never locks everyone out of the store. If the check itself fails for any reason, the back office stays reachable and the incident is recorded. Two-factor authentication protects your store; it will not become the reason you cannot get into it.

## For administrators: getting back in

If an employee loses their phone — or if nobody can get past the code screen — commands run from the server restore access. They are never asked for a code themselves, which is what makes them a reliable way back in.

```bash
# See who is protected, with which app, since when, and how many recovery codes remain
bin/console sentinel:2fa:status

# Turn it off for one employee
bin/console sentinel:2fa:disable --employee=employee@example.com

# Turn it off for everyone
bin/console sentinel:2fa:disable --all

# Give one employee a break from the enrollment policy, without touching the policy
bin/console sentinel:2fa:exempt --employee=employee@example.com --days=30
```

`sentinel:2fa:status` never prints a secret or a code — not even a recovery code. If an employee has also lost their recovery codes, disabling from the server is still the way back in.

`sentinel:2fa:exempt` suspends the [enrollment policy](#requiring-it-for-a-profile) for that one employee, for the number of days given. When they are up, the requirement applies to them again on its own — there is nothing to undo. The Policy tab is left exactly as it was, and every other employee stays under it. Add `--json` to read the result from a script.

## What it covers

Two-factor authentication applies to back-office sign-ins only. Your customers are never affected, and scheduled or command-line tasks keep running as usual.
