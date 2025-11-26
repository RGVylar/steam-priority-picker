import asyncio
import logging
from datetime import datetime
import aiohttp

logger = logging.getLogger(__name__)


class HealthMonitor:
    """Servicio para hacer ping periódico al health endpoint y mantener la app viva"""
    
    def __init__(self, app_url: str, interval_minutes: int = 10):
        self.app_url = app_url
        self.interval_seconds = interval_minutes * 60
        self.is_running = False
        self.task = None
        
    async def start(self):
        """Inicia el monitor de salud"""
        if self.is_running:
            logger.warning("HealthMonitor ya está ejecutándose")
            return
            
        self.is_running = True
        self.task = asyncio.create_task(self._monitor_loop())
        logger.info(f"✅ HealthMonitor iniciado - Ping cada {self.interval_seconds}s ({self.interval_seconds/60:.0f}min)")
        
    async def stop(self):
        """Detiene el monitor de salud"""
        self.is_running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("❌ HealthMonitor detenido")
        
    async def _monitor_loop(self):
        """Loop principal que hace ping periódicamente"""
        while self.is_running:
            try:
                await asyncio.sleep(self.interval_seconds)
                await self._ping()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error en HealthMonitor loop: {e}")
                
    async def _ping(self):
        """Realiza un ping al endpoint de health"""
        health_url = f"{self.app_url}/health"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(health_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        timestamp = datetime.now().isoformat()
                        logger.info(f"✅ Health check OK [{timestamp}]")
                    else:
                        logger.warning(f"⚠️ Health check status {response.status} [{datetime.now().isoformat()}]")
        except asyncio.TimeoutError:
            logger.error(f"⏱️ Health check timeout [{datetime.now().isoformat()}]")
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")


# Instancia global
_health_monitor = None


def get_health_monitor(app_url: str, interval_minutes: int = 10) -> HealthMonitor:
    """Obtiene o crea la instancia global del monitor"""
    global _health_monitor
    
    if _health_monitor is None:
        _health_monitor = HealthMonitor(app_url, interval_minutes)
    
    return _health_monitor
