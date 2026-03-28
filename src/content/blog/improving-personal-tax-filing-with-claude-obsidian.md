---
title: Improving personal tax filing with Claude CLI and Obsidian
description: An opinionated workflow showcasing how I used Claude and Obsidian together to help with my personal tax filing in Canada
publishDate: 2026-03-25
tags:
  - personal
  - productivity
  - ai-retooling
draft: false
comment: true
---
Recently, I found myself in the same part of the year when I do my wife's and my personal taxes here in Canada. Personal income tax filing deadline for most Canadians is usually end of April each year.

It turns out this was also the first year where I had amazing AI tools at my disposal to help me with personal income taxes.

Apart from work, I have been using both ChatGPT and Claude for my personal life as well, which has included varied prompts and workflows such as looking up what engine oil my car takes, or using Notion MCP to create a shopping list for building a deck in my backyard. In short, most of my personal usage has been rather rudimentary compared to my extensive and detailed workflow at work.

I would not call my personal tax situation a complex one, however, given that I manage it for both me and my wife, I would want to optimize it as much as possible.

While collecting all our tax related documents, forms and emails, I came up with a workflow based on Claude Code CLI and Obsidian that I found very useful in trying to get a detailed picture of my tax situation — backed by strong personal context and deterministic calculations using Python.

I set up a working directory for my tax related documents and opened that as a vault in Obsidian.

> If you are unfamiliar with Obsidian, you are missing out a lot on what markdown can do for you especially for the agentic world so I highly recommend you familiarize yourself with this amazing tool today.

Obsidian also has excellent support for viewing PDFs which I found very useful for reviewing my tax forms without leaving the app.

Here is a sample structure that I came up with:

```
obsidian_vault
├── main.py
├── pyproject.toml
├── README.md
├── taxation
│   ├── Currency Rates
│   │   ├── 2024.md
│   │   ├── 2025.md
│   │   └── 2026.md
│   ├── Pasted image 1.png
│   ├── Pasted image 2.png
│   ├── PersonalTax
│   │   └── 2026
│   │       ├── Wife
│   │       │   ├── CLAUDE.md
│   │       │   ├── Etrade Misc Docs
│   │       │   ├── FILED.md
│   │       │   ├── Forms
│   │       │   │   └── T4_2025.pdf
│   │       │   ├── Payroll
│   │       │   │   ├── PayrollEarningStatementReport_JanFeb_2025.pdf
│   │       │   │   └── PayrollEarningStatementReport_MarchDec_2025.pdf
│   │       │   ├── PLAN.md
│   │       └── Rafay
│   │           ├── EMAILS.md
│   │           ├── Charles Schwab Docs
│   │           ├── CLAUDE.md
│   │           ├── Contribution Receipts
│   │           │   └── rsp-contribution-receipt.pdf
│   │           ├── FILED.md
│   │           ├── Forms
│   │           │   └── T4_2025.pdf
│   │           ├── PLAN.md
│   └── References
│       └── Definitions for capital gains Canada.md
├── uv.lock
└── Welcome.md
```

As you might have noticed, I also set up a virtual env with uv and installed the following libs to help Claude extract relevant information from PDFs along with a custom bash function for quick invocations.

**Libs**
- `markitdown[all]` - an open source library from Microsoft to extract information in markdown format, excellent for LLMS since they work well with those.
- `ocrmypdf`

**Bash function**
```bash
pdf2md() {
  local input="$1"
  local venv_markitdown="/Users/rafaypersonal/Documents/obsidian_vault/.venv/bin/markitdown"
  local venv_ocrmypdf="/Users/rafaypersonal/Documents/obsidian_vault/.venv/bin/ocrmypdf"
  # Try direct conversion first (works for text-based/tagged PDFs)
  if "$venv_markitdown" "$input" 2>/dev/null; then
    return 0
  fi
  # Fall back to OCR for scanned PDFs
  local output="${input%.pdf}_ocr.pdf"
  "$venv_ocrmypdf" --skip-text "$input" "$output" && "$venv_markitdown" "$output"
}
```

I used the `CLAUDE.md` file to seed the financial context such as where to find currency rates for ACB calculations, tax forms, RRSP receipts, etc. and asked Claude to update the `PLAN.md` for what I need to do next along with checklists to mark each step as completed once done. I cross checked all the ACB calculations and corrections that it made against an online ACB calculator to make sure it did not hallucinate on my tax filing, given that it was my first time.

Where necessary, I generously seeded the context with the following:
- `EMAILS.md` file that contained any relevant email text with information about my ESPP tax withholding, over-contribution, etc.
	- This was particularly useful for cross checking ESPP payroll deduction, ESPP over-contribution amounts, etc. which can be a bit daunting to validate.
- `taxation/Currency Rates` containing currency rates for the relevant years so that Claude can use them for ACB calculations. I pulled these from https://www.exchange-rates.org/
- I also used a Chrome extension called [LLM Feeder](https://github.com/jatinkrmalik/LLMFeeder) to extract pages such as the Government of Canada's page on [Definitions for capital gains](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-12700-capital-gains/definitions-capital-gains.html). All such information was seeded through the `CLAUDE.md` files.

The tax filing software that I used (Wealthsimple Tax) allows you to generate a draft T1 once you have input all the information. I used that along with `markitdown` and `ocrmypdf` to populate `FILED.md` and asked Claude Code CLI to audit all the information before I submitted the filing.

---

I found Claude Code CLI much more convenient and flexible compared to the Claude desktop app. Combined with Obsidian and a terminal like [Ghostty](https://ghostty.org/), managing personal life stuff with Claude becomes a breeze once you get the hang of it. Having used Notion MCP with the Claude desktop app as well, I would say Claude Code CLI + Obsidian is a step above — the main trade-off being that unlike Notion, you can't really take the Obsidian workflow with you on your phone.

Overall, I was pretty happy with how this turned out. It did not replace my own judgement — I still reviewed every number and cross-checked the important bits — but it made the whole process a lot more organized and honestly less stressful.  If you manage taxes for more than just yourself, even a lightweight setup like this goes a long way. Give it a shot before the April deadline sneak up on you in Canada! 🍁
