# Helix Impulse

Website von Helix Impulse, gehostet mit GitHub Pages.

## Eigene Domain verbinden

1. Im Repo unter **Settings → Pages** bei *Custom domain* die Domain eintragen (z. B. `helix-impulse.de`) und speichern. GitHub legt dabei automatisch eine `CNAME`-Datei an.
2. Beim Domain-Anbieter diese DNS-Einträge setzen:

| Typ   | Name / Host | Wert                        |
|-------|-------------|-----------------------------|
| A     | @           | 185.199.108.153             |
| A     | @           | 185.199.109.153             |
| A     | @           | 185.199.110.153             |
| A     | @           | 185.199.111.153             |
| CNAME | www         | johanklee8-max.github.io    |

3. Nach der DNS-Aktualisierung (Minuten bis einige Stunden) in **Settings → Pages** „Enforce HTTPS“ aktivieren.
