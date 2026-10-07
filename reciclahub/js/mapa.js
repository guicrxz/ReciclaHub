    const initialCoords = [-23.5228, -46.8356];
    const initialZoom = 13;
    let userLocation = null;

    const map = L.map('map', { zoomControl: false }).setView(initialCoords, initialZoom);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_3nla_1_921aae792a9040d5de918c3f', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    const ecopontos = [
      {
        id: 1,
        nome: "Ecoponto Central de Descarte",
        categoria: "Eletrônicos",
        endereco: "Av. Cel. Edelhando Sampaio, 120",
        bairro: "Centro",
        horario: "Seg a Sex: 08h - 17h",
        lat: -23.5228,
        lng: -46.8356,
        cor: "#3b82f6",
        icone: "cpu"
      },
      {
        id: 2,
        nome: "Ponto Verde - Mercado Municipal",
        categoria: "Óleo",
        endereco: "Rua Deputado Emílio Carlos, 45",
        bairro: "Vila Caldas",
        horario: "Seg a Sábado: 07h - 19h",
        lat: -23.5310,
        lng: -46.8410,
        cor: "#eab308",
        icone: "droplet"
      },
      {
        id: 3,
        nome: "Cooperativa de Reciclagem Unidos",
        categoria: "Plástico/Papel",
        endereco: "Rua dos Vicentinos, 310",
        bairro: "Km 21",
        horario: "Terça e Quinta: 08h - 16h",
        lat: -23.5150,
        lng: -46.8250,
        cor: "#10b981",
        icone: "package"
      },
      {
        id: 4,
        nome: "Posto de Coleta de Baterias",
        categoria: "Baterias",
        endereco: "Av. Inocêncio Seráfico, 1500",
        bairro: "Vila Silva",
        horario: "24 Horas",
        lat: -23.5280,
        lng: -46.8300,
        cor: "#ef4444",
        icone: "zap"
      },
      {
        id: 5,
        nome: "Ponto de Reciclagem Vila Menck",
        categoria: "Plástico/Papel",
        endereco: "Rua Apis, 45",
        bairro: "Vila Menck",
        horario: "Seg a Sex: 08h - 17h",
        lat: -23.5398,
        lng: -46.8455,
        cor: "#10b981",
        icone: "package"
      }
    ];

    let currentFilter = 'todos';
    let markersGroup = L.layerGroup().addTo(map);

    function calcularDistancia(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c).toFixed(1);
    }

    function createCustomIcon(cor, iconeName) {
      return L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div class="custom-pin" style="background-color: ${cor}; width: 36px; height: 36px;">
            <i data-lucide="${iconeName}" class="w-5 h-5 text-white"></i>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
    }

    function render() {
      markersGroup.clearLayers();
      const listContainer = document.getElementById('locationsList');
      listContainer.innerHTML = '';

      document.getElementById('totalPoints').innerText = ecopontos.length;

      const searchVal = document.getElementById('searchInput').value.toLowerCase();

      const filtrados = ecopontos.filter(item => {
        const matchesFilter = currentFilter === 'todos' || item.categoria === currentFilter;
        const matchesSearch = item.nome.toLowerCase().includes(searchVal) || item.bairro.toLowerCase().includes(searchVal) || item.endereco.toLowerCase().includes(searchVal);
        return matchesFilter && matchesSearch;
      });

      if (filtrados.length === 0) {
        listContainer.innerHTML = `
          <div class="text-center py-8 text-slate-500 text-sm">
            <i data-lucide="map-pin-off" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
            Nenhum ponto encontrado.
          </div>
        `;
        lucide.createIcons();
        return;
      }

      filtrados.forEach(item => {
        let distText = "";
        if (userLocation) {
          const d = calcularDistancia(userLocation.lat, userLocation.lng, item.lat, item.lng);
          distText = ` • <span class="text-emerald-400 font-semibold">${d} km de você</span>`;
        }

        const marker = L.marker([item.lat, item.lng], {
          icon: createCustomIcon(item.cor, item.icone)
        });

        const rotaUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;

        const popupHTML = `
          <div class="p-2 space-y-1.5">
            <span class="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full text-white" style="background:${item.cor}">
              ${item.categoria}
            </span>
            <h3 class="font-bold text-sm text-slate-100 mt-1">${item.nome}</h3>
            <p class="text-xs text-slate-400">${item.endereco} - ${item.bairro}</p>
            <p class="text-xs text-emerald-400 font-medium">🕒 ${item.horario}</p>
            <div class="pt-1">
              <a href="${rotaUrl}" target="_blank" class="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300">
                <span>Como Chegar (Google Maps)</span> ↗
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupHTML);
        markersGroup.addLayer(marker);

        const card = document.createElement('div');
        card.className = "p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-emerald-500/50 cursor-pointer transition-all hover:translate-x-1 space-y-2";
        
        card.innerHTML = `
          <div class="flex items-start justify-between gap-2" onclick="focarNoPonto(${item.lat}, ${item.lng}, ${item.id})">
            <div>
              <h4 class="font-semibold text-sm text-slate-200">${item.nome}</h4>
              <p class="text-xs text-slate-400 mt-0.5">${item.endereco}</p>
            </div>
            <span class="p-1.5 rounded-lg text-white text-xs shrink-0" style="background-color: ${item.cor}">
              <i data-lucide="${item.icone}" class="w-4 h-4"></i>
            </span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
            <span>Bairro: <strong class="text-slate-300">${item.bairro}</strong>${distText}</span>
            <a href="${rotaUrl}" target="_blank" onclick="event.stopPropagation()" class="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/20 font-medium transition-colors flex items-center gap-1">
              <i data-lucide="navigation" class="w-3 h-3"></i> Naves
            </a>
          </div>
        `;

        listContainer.appendChild(card);
      });

      lucide.createIcons();
    }

    function focarNoPonto(lat, lng, id) {
      map.flyTo([lat, lng], 16, { duration: 1.2 });
      markersGroup.eachLayer(layer => {
        if (layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
          layer.openPopup();
        }
      });
    }

    function setFilter(cat, btn) {
      currentFilter = cat;
      document.querySelectorAll('.chip-btn').forEach(b => {
        b.classList.remove('bg-emerald-600', 'text-white');
        b.classList.add('bg-slate-700', 'text-slate-300');
      });
      btn.classList.remove('bg-slate-700', 'text-slate-300');
      btn.classList.add('bg-emerald-600', 'text-white');
      render();
    }

    function filtrarEcopontos() {
      render();
    }

    function minhaLocalizacao() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const { latitude, longitude } = pos.coords;
          userLocation = { lat: latitude, lng: longitude };
          map.flyTo([latitude, longitude], 15);
          L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: "#3b82f6",
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map).bindPopup("<b>Você está aqui!</b>").openPopup();
          render();
        }, () => {
          alert("Não foi possível obter sua localização.");
        });
      }
    }

    function abrirModalSugerir() {
      document.getElementById('modalSugerir').classList.remove('hidden');
    }

    function fecharModalSugerir() {
      document.getElementById('modalSugerir').classList.add('hidden');
    }

    function salvarNovoPonto(e) {
      e.preventDefault();
      
      const nome = document.getElementById('novoNome').value;
      const categoria = document.getElementById('novaCategoria').value;
      const bairro = document.getElementById('novoBairro').value;
      const endereco = document.getElementById('novoEndereco').value;
      const horario = document.getElementById('novoHorario').value;
      
      let lat = parseFloat(document.getElementById('novaLat').value);
      let lng = parseFloat(document.getElementById('novaLng').value);

      if (isNaN(lat) || isNaN(lng)) {
        lat = -23.5350 + (Math.random() - 0.5) * 0.02;
        lng = -46.8350 + (Math.random() - 0.5) * 0.02;
      }

      let cor = "#10b981";
      let icone = "package";

      if (categoria === "Eletrônicos") { cor = "#3b82f6"; icone = "cpu"; }
      else if (categoria === "Óleo") { cor = "#eab308"; icone = "droplet"; }
      else if (categoria === "Baterias") { cor = "#ef4444"; icone = "zap"; }

      const novoPonto = {
        id: ecopontos.length + 1,
        nome,
        categoria,
        endereco,
        bairro,
        horario,
        lat,
        lng,
        cor,
        icone
      };

      ecopontos.push(novoPonto);
      render();
      fecharModalSugerir();
      document.getElementById('formNovoPonto').reset();
      
      map.flyTo([lat, lng], 16, { duration: 1.2 });
    }

    window.onload = () => {
      render();
      lucide.createIcons();
    };