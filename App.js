import { useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

const colors = {
  white: "#FFFFFF",
  black: "#000000",
  gray100: "#EFF1F4",
  gray200: "#DDE1E6",
  gray300: "#C7CDD6",
  gray400: "#9BA3AF",
  gray500: "#737B88",
  gray600: "#4B5563",
  gray700: "#222936",
  primary: "#4241D9",
  primaryDark: "#24267F",
  positive: "#17C964",
  negative: "#FF5B6E",
  divider: "#ECEEF2"
};

const TransactionTypes = {
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw"
};

const initialGoals = [
  {
    id: "apple-watch",
    name: "Apple Watch",
    target: 1790,
    targetInput: "1.790,00",
    transactions: [
      { id: "t1", type: TransactionTypes.WITHDRAW, value: 20, date: "12/04/25" },
      { id: "t2", type: TransactionTypes.DEPOSIT, value: 300, date: "12/04/25", note: "CDB de 110% no banco XPTO" },
      { id: "t3", type: TransactionTypes.DEPOSIT, value: 300, date: "12/04/25", note: "CDB de 110% no banco XPTO" }
    ]
  },
  { id: "chair", name: "Comprar uma cadeira ergonomica", target: 1200, targetInput: "1.200,00", transactions: [] },
  { id: "rio-trip", name: "Fazer uma viagem para o Rio de Janeiro", target: 3000, targetInput: "3.000,00", transactions: [] }
];

function calculatePercent(current, target) {
  if (!target) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
}

function calculateTransactions(transactions) {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === TransactionTypes.DEPOSIT) {
        return {
          ...totals,
          incoming: totals.incoming + transaction.value,
          current: totals.current + transaction.value
        };
      }

      return {
        ...totals,
        outgoing: totals.outgoing + transaction.value,
        current: totals.current - transaction.value
      };
    },
    { current: 0, incoming: 0, outgoing: 0 }
  );
}

function hydrateGoal(goal) {
  const transactionTotals = calculateTransactions(goal.transactions);
  const current = Math.max(0, transactionTotals.current);

  return {
    ...goal,
    current,
    incoming: transactionTotals.incoming,
    outgoing: transactionTotals.outgoing,
    percent: calculatePercent(current, goal.target)
  };
}

function calculateWalletTotals(goals) {
  return goals.reduce(
    (totals, goal) => ({
      balance: totals.balance + goal.current,
      incoming: totals.incoming + goal.incoming,
      outgoing: totals.outgoing + goal.outgoing
    }),
    { balance: 0, incoming: 0, outgoing: 0 }
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatCurrencyInput(value) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function parseCurrency(text) {
  const clean = String(text ?? "").replace(/[^\d,.]/g, "");

  if (!clean) {
    return 0;
  }

  if (clean.includes(",")) {
    return Number(clean.replace(/\./g, "").replace(",", ".")) || 0;
  }

  if (/^\d{1,3}(\.\d{3})+$/.test(clean)) {
    return Number(clean.replace(/\./g, "")) || 0;
  }

  return Number(clean) || 0;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function today() {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  });
}

function Button({ title, iconName, variant = "primary", style, textStyle, onPress, disabled = false }) {
  const isGhost = variant === "ghost";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, isGhost && styles.buttonGhost, disabled && styles.buttonDisabled, style]}
    >
      {iconName ? <Feather name={iconName} size={18} color={isGhost ? colors.gray600 : colors.white} /> : null}
      <Text style={[styles.buttonText, isGhost && styles.buttonGhostText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

function Header({ title, subtitle, rightIconName, onRightPress, onBack }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.iconButton}>
          <Feather name="arrow-left" size={24} color={colors.black} />
        </TouchableOpacity>

        {rightIconName ? (
          <TouchableOpacity activeOpacity={0.7} onPress={onRightPress} style={styles.iconButton}>
            <Feather name={rightIconName} size={22} color={colors.gray500} />
          </TouchableOpacity>
        ) : null}
      </View>

      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function Input({ label, value, placeholder, multiline, keyboardType = "default", onChangeText }) {
  return (
    <View style={styles.inputBox}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.gray300}
        multiline={multiline}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

function ProgressBar({ percent }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(percent, 100)}%` }]} />
    </View>
  );
}

export default function App() {
  const [goalList, setGoalList] = useState(() => initialGoals.map(hydrateGoal));
  const [route, setRoute] = useState({ name: "home" });

  const walletTotals = useMemo(() => calculateWalletTotals(goalList), [goalList]);

  const selectedGoal = useMemo(
    () => goalList.find((goal) => goal.id === route.id) ?? goalList[0],
    [goalList, route.id]
  );

  const goHome = () => setRoute({ name: "home" });

  function saveGoal({ id, name, target, isEditing }) {
    const safeName = name.trim() || "Nova meta";
    const safeTarget = Math.max(0, target);

    if (isEditing) {
      setGoalList((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === id
            ? hydrateGoal({
                ...goal,
                name: safeName,
                target: safeTarget,
                targetInput: formatCurrencyInput(safeTarget)
              })
            : goal
        )
      );
      setRoute({ name: "progress", id });
      return;
    }

    const newGoal = hydrateGoal({
      id: createId("goal"),
      name: safeName,
      target: safeTarget,
      targetInput: formatCurrencyInput(safeTarget),
      transactions: []
    });

    setGoalList((currentGoals) => [...currentGoals, newGoal]);
    setRoute({ name: "progress", id: newGoal.id });
  }

  function deleteGoal(id) {
    setGoalList((currentGoals) => currentGoals.filter((goal) => goal.id !== id));
    goHome();
  }

  function saveTransaction(goalId, transaction) {
    const value = Math.max(0, transaction.value);
    const goal = goalList.find((item) => item.id === goalId);

    if (!value || !goal) {
      return false;
    }

    if (transaction.type === TransactionTypes.WITHDRAW && value > goal.current) {
      return false;
    }

    const newTransaction = {
      id: createId("transaction"),
      type: transaction.type,
      value,
      date: today(),
      note: transaction.note.trim()
    };

    setGoalList((currentGoals) =>
      currentGoals.map((item) =>
        item.id === goalId
          ? hydrateGoal({
              ...item,
              transactions: [newTransaction, ...item.transactions]
            })
          : item
      )
    );

    setRoute({ name: "progress", id: goalId });
    return true;
  }

  function removeTransaction(goalId, transactionId) {
    const goal = goalList.find((item) => item.id === goalId);
    const transaction = goal?.transactions.find((item) => item.id === transactionId);

    if (!goal || !transaction) {
      return;
    }

    setGoalList((currentGoals) =>
      currentGoals.map((item) => {
        if (item.id !== goalId) {
          return item;
        }

        return hydrateGoal({
          ...item,
          transactions: item.transactions.filter((entry) => entry.id !== transactionId)
        });
      })
    );
  }

  return (
    <>
      <StatusBar style="dark" />

      {route.name === "home" ? (
        <HomeScreen
          goals={goalList}
          totals={walletTotals}
          onNewGoal={() => setRoute({ name: "target" })}
          onGoalPress={(id) => setRoute({ name: "progress", id })}
        />
      ) : null}

      {route.name === "progress" && selectedGoal ? (
        <ProgressScreen
          goal={selectedGoal}
          onBack={goHome}
          onEdit={() => setRoute({ name: "target", mode: "edit", id: selectedGoal.id })}
          onNewTransaction={() => setRoute({ name: "transaction", id: selectedGoal.id })}
          onRemoveTransaction={(transactionId) => removeTransaction(selectedGoal.id, transactionId)}
        />
      ) : null}

      {route.name === "transaction" && selectedGoal ? (
        <TransactionScreen
          goal={selectedGoal}
          onBack={() => setRoute({ name: "progress", id: selectedGoal.id })}
          onSave={(transaction) => saveTransaction(selectedGoal.id, transaction)}
        />
      ) : null}

      {route.name === "target" ? (
        <TargetScreen
          goal={selectedGoal}
          isEditing={route.mode === "edit"}
          onBack={route.mode === "edit" && selectedGoal ? () => setRoute({ name: "progress", id: selectedGoal.id }) : goHome}
          onDelete={selectedGoal ? () => deleteGoal(selectedGoal.id) : undefined}
          onSave={(payload) => saveGoal({ ...payload, id: selectedGoal?.id, isEditing: route.mode === "edit" })}
        />
      ) : null}
    </>
  );
}

function HomeScreen({ goals, totals, onNewGoal, onGoalPress }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.smallText}>Total que voce possui</Text>
        <Text style={styles.balance}>{formatCurrency(totals.balance)}</Text>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryFooter}>
          <View>
            <View style={styles.labelRow}>
              <Feather name="arrow-up" size={12} color={colors.positive} />
              <Text style={styles.smallText}>Entradas</Text>
            </View>
            <Text style={styles.summaryValue}>{formatCurrency(totals.incoming)}</Text>
          </View>

          <View style={styles.rightMetric}>
            <View style={styles.labelRow}>
              <Feather name="arrow-down" size={12} color={colors.negative} />
              <Text style={styles.smallText}>Saidas</Text>
            </View>
            <Text style={styles.summaryValue}>{formatCurrency(totals.outgoing)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Metas</Text>

        <View style={styles.list}>
          {goals.length === 0 ? <Text style={styles.emptyText}>Nenhuma meta cadastrada.</Text> : null}

          {goals.map((goal) => (
            <TouchableOpacity key={goal.id} activeOpacity={0.75} style={styles.goalRow} onPress={() => onGoalPress(goal.id)}>
              <View style={styles.goalContent}>
                <Text numberOfLines={1} style={styles.goalName}>
                  {goal.name}
                </Text>
                <Text style={styles.goalMeta}>
                  {goal.percent}% - {formatCurrency(goal.current)} de {formatCurrency(goal.target)}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.black} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Nova meta" onPress={onNewGoal} />
      </View>
    </SafeAreaView>
  );
}

function ProgressScreen({ goal, onBack, onEdit, onNewTransaction, onRemoveTransaction }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header onBack={onBack} rightIconName="edit-2" onRightPress={onEdit} />

        <Text style={styles.title}>{goal.name}</Text>

        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.inputLabel}>Valor guardado</Text>
            <Text style={styles.saved}>
              {formatCurrency(goal.current)} <Text style={styles.target}>de {formatCurrency(goal.target)}</Text>
            </Text>
          </View>

          <Text style={styles.percent}>{goal.percent}%</Text>
        </View>

        <ProgressBar percent={goal.percent} />

        <Text style={styles.transactionTitle}>Transacoes</Text>

        <View style={styles.transactions}>
          {goal.transactions.length === 0 ? <Text style={styles.emptyText}>Nenhuma transacao cadastrada.</Text> : null}

          {goal.transactions.map((transaction) => {
            const isDeposit = transaction.type === TransactionTypes.DEPOSIT;

            return (
              <View key={transaction.id} style={styles.transactionRow}>
                <Feather
                  name={isDeposit ? "arrow-up" : "arrow-down"}
                  size={20}
                  color={isDeposit ? colors.primary : colors.negative}
                  style={styles.transactionIcon}
                />
                <View style={styles.transactionContent}>
                  <Text style={styles.transactionValue}>{formatCurrency(transaction.value)}</Text>
                  <Text numberOfLines={1} style={styles.transactionDetails}>
                    {transaction.date}
                    {transaction.note ? ` - ${transaction.note}` : ""}
                  </Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={() => onRemoveTransaction(transaction.id)} style={styles.removeButton}>
                  <Feather name="x" size={16} color={colors.gray500} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Nova transacao" onPress={onNewTransaction} />
      </View>
    </SafeAreaView>
  );
}

function TransactionScreen({ goal, onBack, onSave }) {
  const [type, setType] = useState(TransactionTypes.DEPOSIT);
  const [amount, setAmount] = useState("50,00");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function handleSave() {
    const value = parseCurrency(amount);

    if (value <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    if (type === TransactionTypes.WITHDRAW && value > goal.current) {
      setError("Voce nao tem esse valor guardado para resgatar.");
      return;
    }

    setError("");
    const saved = onSave({ type, value, note });

    if (!saved) {
      setError("Nao foi possivel salvar essa transacao.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header
          title="Nova transacao"
          subtitle="A cada valor guardado voce fica mais proximo da sua meta. Se esforce para guardar e evitar retirar."
          onBack={onBack}
        />

        <View style={styles.segment}>
          <Button
            title="Guardar"
            iconName="arrow-up"
            variant={type === TransactionTypes.DEPOSIT ? "primary" : "ghost"}
            style={styles.segmentButton}
            onPress={() => setType(TransactionTypes.DEPOSIT)}
          />
          <Button
            title="Resgatar"
            iconName="arrow-down"
            variant={type === TransactionTypes.WITHDRAW ? "primary" : "ghost"}
            style={styles.segmentButton}
            onPress={() => setType(TransactionTypes.WITHDRAW)}
          />
        </View>

        <Input label="Valor (R$)" value={amount} keyboardType="decimal-pad" onChangeText={setAmount} />
        <Input label="Motivo (opcional)" value={note} placeholder="Ex: Investir em CDB de 110% no banco XPTO" onChangeText={setNote} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button title="Salvar" style={styles.saveButton} onPress={handleSave} />
      </View>
    </SafeAreaView>
  );
}

function TargetScreen({ goal, isEditing, onBack, onDelete, onSave }) {
  const [name, setName] = useState(isEditing ? goal?.name ?? "" : "");
  const [targetInput, setTargetInput] = useState(isEditing ? goal?.targetInput ?? "0,00" : "0,00");
  const [error, setError] = useState("");

  function handleSave() {
    const target = parseCurrency(targetInput);

    if (target <= 0) {
      setError("Informe um valor alvo maior que zero.");
      return;
    }

    setError("");
    onSave({ name, target });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header onBack={onBack} rightIconName={isEditing ? "trash-2" : undefined} onRightPress={onDelete} />

        {isEditing ? (
          <>
            <Text style={styles.title}>Meta</Text>
            <Text style={styles.subtitle}>Economize para alcancar sua meta financeira.</Text>
          </>
        ) : (
          <Text style={styles.intro}>Economize para alcancar sua meta financeira.</Text>
        )}

        <Input label="Nome da meta" value={name} placeholder="Ex: Viagem para praia, Apple Watch" onChangeText={setName} />
        <Input label="Valor alvo (R$)" value={targetInput} keyboardType="decimal-pad" onChangeText={setTargetInput} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button title="Salvar" style={styles.saveButton} onPress={handleSave} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  summary: { height: 330, paddingHorizontal: 26, paddingTop: 108, backgroundColor: colors.primaryDark },
  smallText: { color: "rgba(255, 255, 255, 0.76)", fontSize: 12 },
  balance: { marginTop: 6, color: colors.white, fontSize: 32 },
  summaryDivider: { marginTop: 26, height: 1, backgroundColor: "rgba(255, 255, 255, 0.09)" },
  summaryFooter: { marginTop: 28, flexDirection: "row", justifyContent: "space-between" },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  summaryValue: { marginTop: 8, color: colors.white, fontSize: 14 },
  rightMetric: { alignItems: "flex-end" },
  content: { flex: 1, paddingHorizontal: 24 },
  sectionTitle: { marginTop: 24, color: colors.black, fontSize: 15, fontWeight: "600" },
  list: { marginTop: 10 },
  emptyText: { marginTop: 20, color: colors.gray500, fontSize: 13 },
  goalRow: { minHeight: 68, borderBottomWidth: 1, borderBottomColor: colors.divider, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  goalContent: { flex: 1, paddingRight: 12 },
  goalName: { color: colors.black, fontSize: 14, fontWeight: "600" },
  goalMeta: { marginTop: 6, color: colors.gray500, fontSize: 11 },
  footer: { paddingHorizontal: 24, paddingBottom: 28 },
  button: { height: 48, borderRadius: 6, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  buttonGhost: { backgroundColor: colors.gray100 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  buttonGhostText: { color: colors.gray600 },
  header: { paddingTop: 10 },
  headerRow: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { marginTop: 28, color: colors.black, fontSize: 24, fontWeight: "700" },
  subtitle: { marginTop: 6, color: colors.gray400, fontSize: 13 },
  inputBox: { width: "100%", marginTop: 24 },
  inputLabel: { color: colors.gray400, fontSize: 12, marginBottom: 8 },
  input: { minHeight: 34, borderBottomWidth: 1, borderBottomColor: colors.divider, color: colors.gray700, fontSize: 14, padding: 0, paddingBottom: 9 },
  multiline: { minHeight: 42, textAlignVertical: "top" },
  progressHeader: { marginTop: 32, marginBottom: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  saved: { marginTop: 4, color: colors.black, fontSize: 16, fontWeight: "700" },
  target: { color: colors.gray500, fontSize: 12, fontWeight: "400" },
  percent: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  progressTrack: { width: "100%", height: 4, borderRadius: 2, backgroundColor: colors.gray200, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2, backgroundColor: colors.primary },
  transactionTitle: { marginTop: 56, color: colors.black, fontSize: 15, fontWeight: "600" },
  transactions: { marginTop: 14 },
  transactionRow: { minHeight: 64, borderBottomWidth: 1, borderBottomColor: colors.divider, flexDirection: "row", alignItems: "center" },
  transactionIcon: { marginRight: 14 },
  transactionContent: { flex: 1 },
  transactionValue: { color: colors.black, fontSize: 14, fontWeight: "600" },
  transactionDetails: { marginTop: 4, color: colors.gray500, fontSize: 11 },
  removeButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  segment: { marginTop: 22, minHeight: 46, borderRadius: 6, backgroundColor: colors.gray100, flexDirection: "row", padding: 2 },
  segmentButton: { flex: 1, height: 42 },
  saveButton: { marginTop: 28 },
  intro: { marginTop: 78, color: colors.gray500, fontSize: 13 },
  errorText: { marginTop: 14, color: colors.negative, fontSize: 12 }
});
