# Helpers for the chemistry grade-12 lesson files (data/chem12_*.py).
# A lesson is written period by period: periods = [[rows of period 1], [rows of period 2], ...]; each period must sum to 40 minutes.
# Period 1 starts with the lesson warm-up row; periods 2..N start with an OPEN row (prior-learning question + new hook) and
# periods 1..N-1 end with a CLOSE row (formative check); the last row of the last period is the lesson exit ticket.
C = "chem12"

def R(phase, strat, mins, objs, teacher, student, tool, q, ans, crit):
    if isinstance(teacher, str): teacher = [teacher]
    if isinstance(student, str): student = [student]
    return [phase, strat, mins, objs, teacher, student, {"tool": tool, "q": q, "ans": ans, "crit": crit}]

def OPEN(teacher, student, q, ans, crit, tool="سؤال شفهي", strat="الأسئلة السابرة", mins=5):
    return R("تعلم قبلي وتمهيد", strat, mins, [], teacher, student, tool, q, ans, crit)

def CLOSE(teacher, student, q, ans, crit, tool="بطاقة الخروج", mins=5):
    return R("تقويم ختامي للحصة", "بطاقة الخروج", mins, [], teacher, student, tool, q, ans, crit)

class Unit:
    def __init__(self, S, N, title, short):
        self.S, self.N, self.title, self.short = S, N, title, short
        self.DB, self.AU, self.PER = {}, {}, {}
    def key(self, n): return f"{C}~{self.N}_{n}"
    def lesson(self, n, title, objectives, periods, prior, warm, exit, homework, support, enrich, resources, strategies, lab, misconception, guideAnswers, code=None):
        k = self.key(n); N = len(periods)
        objs = []
        for i, (ocode, text, acts) in enumerate(objectives):
            objs.append({"id": f"{k}_o{i}", "code": ocode, "text": text, "selected": True, "suffix": "", "activities": [
                {"time45": a[0], "time90": a[1], "teacher": a[2], "student": a[3], "eval": a[4]} for a in acts]})
        rows, pstart = [], []
        for p, P in enumerate(periods):
            s = sum(r[2] for r in P)
            assert s == 40, (k, "period", p + 1, "minutes", s, [r[2] for r in P])
            assert any(r[3] for r in P), (k, "period", p + 1, "has no objective row")
            if p < N - 1: assert not P[-1][3], (k, "period", p + 1, "closer must have no objectives")
            if p: assert not P[0][3], (k, "period", p + 1, "opener must have no objectives")
            pstart.append(len(rows)); rows.extend(P)
        for r in rows:   # the 30 mm phase column: a title longer than ~18 characters wraps and makes the row 3 mm taller
            if r[1] != "بطاقة الخروج" or r[3]: assert len(r[0]) <= 18 or r[0] == "تعلم قبلي وتمهيد", (k, "phase title too long", r[0])
        qs = [r[6]["q"] for r in rows]
        for r in rows:   # length hints (printed layout): formative item ~110 chars, one teacher item ~140 chars
            t = r[6]
            if len(t["q"]) + len(t["ans"]) > 125: print("  [len]", k, r[0], "q+ans =", len(t["q"]) + len(t["ans"]))
            for x in r[4]:
                if len(x) > 150: print("  [len]", k, r[0], "teacher item", len(x))
        assert len(set(qs)) == len(qs), (k, "duplicate formative questions")
        assert rows[-1][6]["q"] == exit["q"] and rows[-1][6]["ans"] == exit["a"], (k, "last row must carry the exit ticket")
        self.DB[k] = {"course": C, "sem": self.S, "unitNum": self.N, "unitTitle": self.title, "unitShort": self.short,
                      "code": code or f"{self.N}-{n}", "title": title, "defaultDuration": 45, "objectives": objs,
                      "prior": "؛ ".join(prior["items"]), "warmup": warm["question"], "resources": resources, "strategies": strategies,
                      "lab": lab, "misconception": misconception, "exitTicket": exit["q"], "homework": homework, "guideAnswers": guideAnswers}
        self.AU[k] = {"prior": prior, "warm": warm, "periods": [{"objs": list(range(len(objs))), "rows": rows}], "pstart": pstart,
                      "exit": exit, "homework": homework, "support": support, "enrich": enrich}
        self.PER[k] = N
        return k
