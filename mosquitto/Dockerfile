# Pakai base image resmi Mosquitto
FROM eclipse-mosquitto

# Copy file konfigurasi ke dalam image
COPY ./config/mosquitto.conf /mosquitto/config/mosquitto.conf

# Opsional: copy file user password kalau pakai autentikasi
# COPY ./config/passwordfile /mosquitto/config/passwordfile

# Folder data dan log bisa juga disiapkan dari luar lewat volume
# Jadi cukup expose port dan selesai
EXPOSE 1883
# EXPOSE 9001
