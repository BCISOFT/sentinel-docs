---
sidebar_position: 6
---

# Two-Factor Authentication

Two-factor authentication asks for a second proof of identity when you sign in to the back office: your password, then a temporary code from an authenticator app on your phone (Google Authenticator, Authy, 1Password, and others).

Even if someone steals or guesses your password, they cannot get in without your phone.

This feature is **free**. Each employee turns it on for their own account, and can turn it off again — there is no store-wide setting yet.

## Turning it on

Go to **Sentinel > Two-Factor Authentication > My methods** and start the wizard.

1. **Scan the QR code.** Open your authenticator app, choose to add an account, and point your camera at the QR code on screen. If you would rather type things in by hand, the same key is also shown as a line of text you can copy.
2. **Confirm.** Your app now shows a six-digit number that changes every thirty seconds. Type the current one into the wizard. This last step proves your app and the store agree before anything is switched on.

That's it. Your account is protected from the next sign-in onwards.

:::info Your secret stays in your store
The QR code is drawn by your own browser, and nothing is sent to any outside service while you set this up. Your store keeps the secret in encrypted form and never shows it again afterwards.
:::

## Signing in afterwards

Once your account is protected, signing in has one extra step: after your password, Sentinel asks for the six-digit code from your app. Nothing else in the back office opens until you enter a valid one.

After that, you are not asked again for a while. When that period ends, the next sign-in asks for a fresh code.

A few rules keep the code safe to use:

- A code works **once**. Even within the thirty seconds it stays on your screen, it cannot be used a second time.
- A small difference between your phone's clock and the store's clock is tolerated, so you don't get locked out over a few seconds.
- After six wrong codes in a row, the address trying to sign in is blocked, and the attempt is recorded.

## Turning it off

From **My methods**, remove your authenticator app and confirm. Your password alone is enough at the next sign-in.

## Keeping track

Sentinel records each time an account is protected, each successful and failed code entry, and each removal in the [Security Logs](./security-logs.md), along with the address it came from.

## If something goes wrong

Sentinel is built so that a problem with the second-factor check never locks everyone out of the store. If the check itself fails for any reason, the back office stays reachable and the incident is recorded. Two-factor authentication protects your store; it will not become the reason you cannot get into it.

## For administrators: getting back in

If an employee loses their phone — or if nobody can get past the code screen — two commands run from the server restore access. They are never asked for a code themselves, which is what makes them a reliable way back in.

```bash
# See who is protected, with which app, and since when
bin/console sentinel:2fa:status

# Turn it off for one employee
bin/console sentinel:2fa:disable --employee=employee@example.com

# Turn it off for everyone
bin/console sentinel:2fa:disable --all
```

`sentinel:2fa:status` never prints a secret or a code.

## What it covers

Two-factor authentication applies to back-office sign-ins only. Your customers are never affected, and scheduled or command-line tasks keep running as usual.
