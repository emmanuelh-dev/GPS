import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatTime } from "../common/util/formatter";
import logo from "../../public/1.png";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 5,
    color: "gray",
  },
  section: {
    flexGrow: 1,
    marginTop: 20,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#bfbfbf",
    alignItems: "center",
  },
  headerCell: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    padding: 6,
    flex: 1,
    textAlign: "center",
    fontSize: 10,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 8,
  },
});

const PDF = ({ positions, deviceName }) => {
  const totalPositions = positions.length;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />
          <Text style={styles.title}>Reporte Historial GPS</Text>
        </View>
        <View>
          <Text style={styles.subtitle}>
            {`Reporte de ${formatTime(positions[0].fixTime, "seconds", false)} al ${formatTime(positions[totalPositions - 1].fixTime, "seconds", false)}`}
          </Text>
          <Text style={styles.subtitle}>{totalPositions} Movimientos.</Text>
          <Text style={styles.subtitle}>Unidad: {deviceName}</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.headerCell}>
                <Text>Motor</Text>
              </View>
              <View style={styles.headerCell}>
                <Text>KM/H</Text>
              </View>
              <View style={styles.headerCell}>
                <Text>Fecha/Hora</Text>
              </View>
              <View style={styles.headerCell}>
                <Text>Lat</Text>
              </View>
              <View style={styles.headerCell}>
                <Text>Lon</Text>
              </View>
              {positions[0]?.attributes?.bleTemp1 && (
                <View style={styles.headerCell}>
                  <Text>Temp</Text>
                </View>
              )}
              <View style={styles.headerCell}>
                <Text>Km</Text>
              </View>
            </View>
            {/* Datos de la tabla */}
            {positions.map((position) => (
              <View
                key={position.attributes.totalDistance}
                style={styles.tableRow}
              >
                <View style={styles.cell}>
                  <Text>Encendido</Text>
                </View>
                <View style={styles.cell}>
                  <Text>{position.speed}</Text>
                </View>
                <View style={styles.cell}>
                  <Text>{formatTime(position.fixTime, "seconds", false)}</Text>
                </View>
                <View style={styles.cell}>
                  <Text>{position.latitude}</Text>
                </View>
                <View style={styles.cell}>
                  <Text>{position.longitude}</Text>
                </View>
                {position.attributes?.bleTemp1 && (
                  <View style={styles.cell}>
                    <Text>
                      {Math.round(position.attributes.bleTemp1)}° /
                      {Math.round(position.attributes.bleTemp1 * (9 / 5) + 32)}°
                    </Text>
                  </View>
                )}
                <View style={styles.cell}>
                  <Text>{position.attributes.totalDistance}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDF;
