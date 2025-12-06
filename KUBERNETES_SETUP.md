# Инструкция по запуску Kubernetes на Windows

## Вариант 1: Docker Desktop с Kubernetes (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Установка и настройка Docker Desktop

1. Установите Docker Desktop для Windows: https://www.docker.com/products/docker-desktop
2. Откройте Docker Desktop
3. Перейдите в Settings → Kubernetes
4. Включите опцию "Enable Kubernetes"
5. Нажмите "Apply & Restart"

### Шаг 2: Проверка установки

```powershell
# Проверить, что Kubernetes запущен
kubectl cluster-info

# Проверить версию kubectl
kubectl version --client

# Проверить ноды кластера
kubectl get nodes
```

### Шаг 3: Сборка Docker образов

Перед развертыванием в Kubernetes нужно собрать Docker образы для всех сервисов:

```powershell
# Перейти в корневую директорию проекта
cd C:\Users\Grifo\WebstormProjects\weather-app

# Собрать образы для всех сервисов
docker build -t analytics-service:latest ./analytics-service
docker build -t weather-service:latest ./weather-service
docker build -t gateway:latest ./gateway
docker build -t client:latest ./client

# Проверить, что образы созданы
docker images | findstr "analytics-service weather-service gateway client"
```

### Шаг 4: Развертывание в Kubernetes

```powershell
# Применить манифесты Kubernetes
kubectl apply -f all.yaml

# Проверить статус pod'ов
kubectl get pods

# Проверить статус сервисов
kubectl get services

# Проверить статус всех ресурсов
kubectl get all
```

### Шаг 5: Ожидание готовности pod'ов

```powershell
# Дождаться, пока все pod'ы будут в статусе Running
kubectl get pods -w

# Или проверить статус конкретного pod'а
kubectl get pod <pod-name>
kubectl describe pod <pod-name>
```

### Шаг 6: Просмотр логов

```powershell
# Просмотр логов конкретного pod'а
kubectl logs <pod-name>

# Просмотр логов с отслеживанием (как tail -f)
kubectl logs -f <pod-name>

# Просмотр логов всех pod'ов сервиса
kubectl logs -l app=gateway
```

### Шаг 7: Доступ к приложению

```powershell
# Port forwarding для доступа к сервисам
kubectl port-forward svc/gateway 4000:4000
kubectl port-forward svc/client 3000:3000

# В отдельных окнах PowerShell можно также пробросить:
kubectl port-forward svc/weather-service 4001:4001
kubectl port-forward svc/analytics-service 4002:4002
```

После port forwarding приложение будет доступно:
- Клиент: http://localhost:3000
- GraphQL: http://localhost:4000/graphql
- Weather API: http://localhost:4001
- Analytics API: http://localhost:4002

---

## Вариант 2: Minikube

### Шаг 1: Установка Minikube

```powershell
# Скачать Minikube
# https://minikube.sigs.k8s.io/docs/start/

# Или через Chocolatey (если установлен)
choco install minikube

# Или через winget
winget install Kubernetes.minikube
```

### Шаг 2: Запуск Minikube

```powershell
# Запустить Minikube
minikube start

# Проверить статус
minikube status

# Настроить kubectl для работы с Minikube
kubectl config use-context minikube
```

### Шаг 3: Сборка образов в Minikube

```powershell
# Использовать Docker окружение Minikube
minikube docker-env
# Выполнить команду, которую выведет предыдущая команда (например):
# & minikube -p minikube docker-env | Invoke-Expression

# Собрать образы
docker build -t analytics-service:latest ./analytics-service
docker build -t weather-service:latest ./weather-service
docker build -t gateway:latest ./gateway
docker build -t client:latest ./client
```

### Шаг 4: Развертывание

```powershell
# Применить манифесты
kubectl apply -f all.yaml

# Проверить статус
kubectl get pods
kubectl get services
```

### Шаг 5: Доступ к приложению

```powershell
# Получить URL для доступа через Minikube
minikube service client --url

# Или использовать port forwarding
kubectl port-forward svc/client 3000:3000
kubectl port-forward svc/gateway 4000:4000
```

---

## Полезные команды для управления

### Просмотр ресурсов

```powershell
# Все ресурсы
kubectl get all

# Pod'ы
kubectl get pods

# Сервисы
kubectl get services

# Deployment'ы
kubectl get deployments

# PersistentVolumeClaim
kubectl get pvc
```

### Управление pod'ами

```powershell
# Описание pod'а
kubectl describe pod <pod-name>

# Логи pod'а
kubectl logs <pod-name>

# Выполнить команду в pod'е
kubectl exec -it <pod-name> -- /bin/sh

# Удалить pod
kubectl delete pod <pod-name>
```

### Масштабирование

```powershell
# Увеличить количество реплик Gateway
kubectl scale deployment gateway --replicas=3

# Автоматическое масштабирование (если установлен metrics-server)
kubectl autoscale deployment gateway --min=1 --max=5 --cpu-percent=80
```

### Обновление и перезапуск

```powershell
# Перезапустить deployment
kubectl rollout restart deployment/gateway

# Проверить историю rollout
kubectl rollout history deployment/gateway

# Откатить к предыдущей версии
kubectl rollout undo deployment/gateway
```

### Удаление

```powershell
# Удалить все ресурсы из манифеста
kubectl delete -f all.yaml

# Удалить конкретный deployment
kubectl delete deployment gateway

# Удалить все pod'ы
kubectl delete pods --all
```

### Отладка

```powershell
# Проверить события
kubectl get events --sort-by='.lastTimestamp'

# Проверить конфигурацию deployment
kubectl get deployment gateway -o yaml

# Проверить конфигурацию service
kubectl get service gateway -o yaml

# Проверить логи всех pod'ов с меткой
kubectl logs -l app=gateway --all-containers=true
```

---

## Решение проблем

### Проблема: Pod'ы в статусе ImagePullBackOff или ErrImagePull

**Решение:** Образы не найдены. Убедитесь, что:
1. Образы собраны локально (`docker images`)
2. В `all.yaml` установлен `imagePullPolicy: Never` (для локальных образов)
3. Или используйте Docker Hub/Registry для хранения образов

### Проблема: Pod'ы в статусе Pending

**Решение:** Проверьте:
```powershell
kubectl describe pod <pod-name>
# Ищите секцию Events для причин
```

### Проблема: Pod'ы в статусе CrashLoopBackOff

**Решение:** Проверьте логи:
```powershell
kubectl logs <pod-name>
kubectl describe pod <pod-name>
```

### Проблема: Сервисы не могут подключиться друг к другу

**Решение:** Проверьте:
1. Имена сервисов в environment переменных совпадают с именами в Service
2. Порты указаны правильно
3. DNS работает: `kubectl exec -it <pod-name> -- nslookup <service-name>`

---

## Быстрая проверка работоспособности

```powershell
# 1. Проверить, что все pod'ы запущены
kubectl get pods

# 2. Проверить health check
kubectl exec -it <gateway-pod-name> -- curl http://localhost:4000/health

# 3. Проверить доступность через port forwarding
kubectl port-forward svc/gateway 4000:4000
# В браузере: http://localhost:4000/graphql

# 4. Проверить логи на ошибки
kubectl logs -l app=gateway --tail=50
```

---

## Примечания

- Для production используйте внешний registry (Docker Hub, GitHub Container Registry)
- Измените `imagePullPolicy: Never` на `imagePullPolicy: Always` или `IfNotPresent`
- Настройте ресурсы (CPU, Memory) для pod'ов в манифестах
- Добавьте health checks (livenessProbe, readinessProbe) в манифесты
- Используйте ConfigMaps и Secrets для конфигурации

