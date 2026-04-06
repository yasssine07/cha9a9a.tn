"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
  date: Date | string;
  type?: "date" | "time" | "datetime";
  options?: Intl.DateTimeFormatOptions;
}

export default function FormattedDate({ date, type = "date", options }: FormattedDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or same-length string to minimize layout shift
    // Or just null if fine with small shift
    return <span className="opacity-0">...</span>;
  }

  const d = new Date(date);
  
  if (type === "date") {
    return <span>{d.toLocaleDateString("fr-FR", options)}</span>;
  } else if (type === "time") {
    return <span>{d.toLocaleTimeString("fr-FR", options)}</span>;
  } else {
    return (
      <span>
        {d.toLocaleDateString("fr-FR")} à {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </span>
    );
  }
}
