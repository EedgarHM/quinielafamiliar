import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Salida autocontenida para empaquetar en una imagen Docker mínima.
  output: "standalone",
  // 'mongodb' es un módulo de Node: que el servidor lo cargue en runtime,
  // sin intentar empaquetarlo (evita errores de bundling).
  serverExternalPackages: ["mongodb"],
};

export default nextConfig;
