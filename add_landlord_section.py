#!/usr/bin/env python3
path = "src/pages/HomePage.tsx"
with open(path) as f:
    content = f.read()

# 1. Add ShieldCheck to the lucide-react import
old_import = "import { ArrowRight, BadgeCheck, Building2, Clock, Heart, Map as MapIcon, Play, Star } from 'lucide-react';"
new_import = "import { ArrowRight, BadgeCheck, Building2, Clock, Heart, Map as MapIcon, Play, ShieldCheck, Star } from 'lucide-react';"
assert old_import in content, "import line not found"
content = content.replace(old_import, new_import, 1)

# 2. Insert the landlord section right before Testimonials
anchor = "      {/* ── Testimonials ─────────────────────────────────────────────────────── */}"
landlord_section = '''      {/* ── For landlords & property managers ──────────────────────────────── */}
      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20 dark:shadow-black/50 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase text-white/70">
                <ShieldCheck size={13} />
                For landlords & property managers
              </div>
              <h2 className="text-3xl font-black sm:text-4xl">
                Manage your properties with confidence
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/60">
                StayLynk helps landlords, property managers, and caretakers manage rent collection, maintenance, vacancies, and tenant communication from one secure platform — while your listings stay visible to verified renters searching StayLynk every day.
              </p>
            </div>
            <Link
              to="/list-property"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 text-sm font-black text-slate-950 shadow-md transition hover:bg-white/90"
            >
              Manage your property
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

''' + anchor

assert anchor in content, "Testimonials anchor not found"
content = content.replace(anchor, landlord_section, 1)

with open(path, "w") as f:
    f.write(content)

print("[OK] Landlord section added to HomePage.tsx")
