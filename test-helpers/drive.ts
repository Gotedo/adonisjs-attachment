declare module '@ioc:Adonis/Core/Drive' {
  interface DisksList {
    local: {
      config: LocalDriverConfig
      implementation: LocalDriverContract
    }
    r2: {
      config: R2DriverConfig
      implementation: R2DriverContract
    }
  }
}
