"use client";
import React from "react";

export default function Footer() {
  const [hover, setHover] = React.useState(false);
  return (
    <footer
      style={{
        width: "100%",
        padding: "0.7rem 2rem",
        background: "#f6f8fa",
        borderTop: "1.5px solid #e0e3e7",
        textAlign: "center",
        color: "#22336b",
        fontWeight: 500,
        fontSize: 15,
        position: "fixed",
        left: 0,
        bottom: 0,
        zIndex: 1201,
      }}
    >
      {'\u00a9'} {new Date().getFullYear()}{' '}
      <a
        href="https://www.tabix.app"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#22336b",
          textDecoration: hover ? "underline" : "none",
          fontWeight: 600,
          transition: "text-decoration 0.2s",
        }}
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
      >
        Tabix Group
      </a>
      . Todos los derechos reservados.
    </footer>
  );
}
