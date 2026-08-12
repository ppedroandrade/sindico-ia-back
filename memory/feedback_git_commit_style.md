---
name: git commit style
description: Never add Claude as Co-Authored-By or any other collaborator trailer in commits made for this user
type: feedback
---

Nunca incluir `Co-Authored-By: Claude ...` (ni ningún otro co-author trailer) en los commits.

**Why:** El usuario lo pidió explícitamente ("comita pero no te agregues como colaborador"). Ya lo mencionó antes — el commit `17c0350` fue justamente para retirar coautoría de Claude en un commit previo.

**How to apply:** Al construir mensajes de commit para este usuario, terminar en la línea de descripción. Nada de bloques `Co-Authored-By`, `Generated with`, ni firmas de asistente. Aplica a todos los repos de este usuario salvo que pida lo contrario.